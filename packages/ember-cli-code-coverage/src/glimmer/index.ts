import type {
  TemplateBranchMeta,
  TemplateCoveragePluginOptions,
  TemplateSourceRange,
} from '../types.js';

/**
 * Glimmer AST plugin that instruments templates for branch coverage.
 *
 * The plugin rewrites each template so that, at render time, it reports
 * which branches were taken:
 *
 * - `{{coverage-init}}` at the root registers an Istanbul-shaped coverage
 *   object for the template in `window.__coverage__`.
 * - `{{coverage-mark}}` at the start of each block branch body records a
 *   hit for that branch path.
 * - `(coverage-cond ...)` wraps inline `if`/`unless` conditions, recording
 *   a hit for whichever side the condition selects while passing the
 *   original value straight through.
 *
 * Helper names are dash-cased so the classic resolver finds them. The
 * helpers themselves reach the app tree through this addon's `app-js`
 * re-exports.
 *
 * Blocks with no `{{else}}` get an empty inverse block added, purely so
 * the untaken path is reportable — the same way Istanbul reports the
 * implicit else of a JavaScript `if`.
 */

const INIT_HELPER = 'coverage-init';
const MARK_HELPER = 'coverage-mark';
const COND_HELPER = 'coverage-cond';

const TEMPLATE_EXTENSION = /\.(hbs|gjs|gts)$/;

/** Blocks that always render their body, so they introduce no branch. */
const NON_BRANCH_BLOCKS = new Set(['let', 'with', 'in-element', '-in-element']);

/** Blocks whose `{{else}}` marks an empty-collection path rather than a negation. */
const COLLECTION_BLOCKS = new Set(['each', 'each-in']);

const CONDITIONAL_BLOCKS = new Set(['if', 'unless']);

interface SourcePosition {
  line: number;
  column: number;
}

interface SourceLocation {
  start?: SourcePosition;
  end?: SourcePosition;
  startPosition?: SourcePosition;
  endPosition?: SourcePosition;
}

interface AstNode {
  type: string;
  loc?: SourceLocation;
}

interface PathNode extends AstNode {
  original?: string;
  parts?: string[];
  head?: { name?: string };
}

interface BlockNode extends AstNode {
  path: PathNode;
  params: AstNode[];
  program: { body: AstNode[]; chained?: boolean };
  inverse?: { body: AstNode[]; chained?: boolean } | null;
}

interface CallNode extends AstNode {
  path: PathNode;
  params: AstNode[];
}

interface StringLiteralNode extends AstNode {
  value: string;
}

interface MustacheNode extends AstNode {
  params: AstNode[];
}

interface Builders {
  mustache(path: AstNode, params?: AstNode[]): MustacheNode;
  sexpr(path: AstNode, params?: AstNode[]): AstNode;
  path(original: string): AstNode;
  string(value: string): AstNode;
  number(value: number): AstNode;
  boolean(value: boolean): AstNode;
  blockItself(body: AstNode[]): { body: AstNode[] };
}

interface PluginEnvironment {
  syntax: { builders: Builders };
  meta?: { moduleName?: string };
}

interface AstPlugin {
  name: string;
  visitor: Record<string, unknown>;
}

const EMPTY_RANGE: TemplateSourceRange = {
  start: { line: 0, column: 0 },
  end: { line: 0, column: 0 },
};

/**
 * Read a source range off an AST node, tolerating both the SourceSpan API
 * (`startPosition`/`endPosition`) and the older plain `start`/`end` shape.
 */
function rangeOf(node: AstNode | undefined): TemplateSourceRange {
  const loc = node?.loc;
  if (!loc) return EMPTY_RANGE;

  const start = loc.startPosition ?? loc.start;
  const end = loc.endPosition ?? loc.end;

  if (!start || !end) return EMPTY_RANGE;

  return {
    start: { line: start.line, column: start.column },
    end: { line: end.line, column: end.column },
  };
}

/** Range spanning a block body, falling back to the block itself when empty. */
function rangeOfBody(
  body: AstNode[] | undefined,
  fallback: AstNode,
): TemplateSourceRange {
  if (!body || body.length === 0) return rangeOf(fallback);

  return {
    start: rangeOf(body[0]).start,
    end: rangeOf(body[body.length - 1]!).end,
  };
}

/** The helper or block name a path node refers to. */
function nameOf(path: PathNode | undefined): string {
  if (!path) return '';
  return path.original ?? path.head?.name ?? path.parts?.[0] ?? '';
}

/**
 * Normalize the module name the compiler handed us into something the
 * coverage middleware can resolve back to a file on disk.
 */
function normalizeModuleName(moduleName: string): string {
  if (TEMPLATE_EXTENSION.test(moduleName)) return moduleName;
  return `${moduleName}.hbs`;
}

export function createTemplateCoveragePlugin(
  options: TemplateCoveragePluginOptions = {},
): (env: PluginEnvironment) => AstPlugin {
  const coverageEnvVar = options.coverageEnvVar ?? 'COVERAGE';

  // Keyed by module name so multiple templates in one file (a `.gts` with
  // several `<template>` blocks) get non-colliding branch ids.
  const branchCounters = new Map<string, number>();

  return function templateCoveragePlugin(env: PluginEnvironment): AstPlugin {
    if (process.env[coverageEnvVar] !== 'true') {
      return { name: 'ember-cli-code-coverage-noop', visitor: {} };
    }

    const moduleName = normalizeModuleName(env.meta?.moduleName ?? 'unknown');
    const b = env.syntax.builders;
    const branches: Record<number, TemplateBranchMeta> = {};

    let nextBranchId = branchCounters.get(moduleName) ?? 0;
    let rootBody: AstNode[] | undefined;
    let initNode: MustacheNode | undefined;

    // Glimmer may walk the tree more than once when a plugin mutates it.
    // Instrumenting a node twice would double-count every branch, so each
    // node is only ever visited once.
    const instrumented = new WeakSet<object>();

    const mark = (branchId: number, locationId: number): AstNode =>
      b.mustache(b.path(MARK_HELPER), [
        b.string(moduleName),
        b.number(branchId),
        b.number(locationId),
      ]);

    const wrapCondition = (
      branchId: number,
      reversed: boolean,
      condition: AstNode,
    ): AstNode =>
      b.sexpr(b.path(COND_HELPER), [
        b.string(moduleName),
        b.number(branchId),
        b.boolean(reversed),
        condition,
      ]);

    /**
     * Instrument a block that branches: `{{#if}}`, `{{#unless}}`, and
     * `{{#each}}`/`{{#each-in}}` with their empty-collection path.
     */
    function instrumentBlock(node: BlockNode): void {
      if (instrumented.has(node)) return;
      instrumented.add(node);

      const branchId = nextBranchId++;
      const consequent = rangeOfBody(node.program.body, node);

      // A chained `{{else if}}` describes its own branches, so the outer
      // block only claims the path it owns.
      const chainedInverse = node.inverse?.chained === true;

      const locations: TemplateSourceRange[] = chainedInverse
        ? [consequent]
        : [
            consequent,
            node.inverse ? rangeOfBody(node.inverse.body, node) : rangeOf(node),
          ];

      registerBranch(branchId, {
        type: 'if',
        loc: rangeOf(node),
        locations,
      });

      node.program.body.unshift(mark(branchId, 0));

      if (chainedInverse) return;

      if (node.inverse) {
        node.inverse.body.unshift(mark(branchId, 1));
      } else {
        node.inverse = b.blockItself([mark(branchId, 1)]) as {
          body: AstNode[];
        };
      }
    }

    /**
     * Instrument an inline `if`/`unless` by wrapping its condition. The
     * helper returns the condition untouched, so template semantics are
     * unchanged.
     */
    function instrumentInlineConditional(node: CallNode): void {
      if (instrumented.has(node)) return;

      const name = nameOf(node.path);
      const condition = node.params[0];

      if (!condition) return;
      instrumented.add(node);

      const branchId = nextBranchId++;
      const consequent = rangeOf(node.params[1] ?? node);
      const alternate = rangeOf(node.params[2] ?? node);

      registerBranch(branchId, {
        type: 'cond-expr',
        loc: rangeOf(node),
        locations: [consequent, alternate],
      });

      node.params[0] = wrapCondition(branchId, name === 'unless', condition);
    }

    // The outermost node is visited first, so the first body we see is
    // the template root.
    const captureRoot = (node: { body: AstNode[] }): void => {
      rootBody ??= node.body;
    };

    /**
     * Record a branch and keep the root's `{{coverage-init}}` in step.
     *
     * The init node is added as soon as there is something to report and
     * then updated in place, rather than being appended once the walk
     * finishes — mutating the root body at that point is what makes
     * Glimmer walk the tree a second time.
     */
    function registerBranch(id: number, meta: TemplateBranchMeta): void {
      branches[id] = meta;
      branchCounters.set(moduleName, nextBranchId);

      if (!rootBody) return;

      if (!initNode) {
        initNode = b.mustache(b.path(INIT_HELPER), [
          b.string(moduleName),
          b.string('{}'),
        ]);
        rootBody.unshift(initNode);
      }

      (initNode.params[1] as StringLiteralNode).value =
        JSON.stringify(branches);
    }

    const visitor: Record<string, unknown> = {
      Template: { enter: captureRoot },

      BlockStatement(node: BlockNode) {
        const name = nameOf(node.path);

        if (NON_BRANCH_BLOCKS.has(name)) return;

        if (CONDITIONAL_BLOCKS.has(name)) {
          instrumentBlock(node);
          return;
        }

        // A collection block only branches when it distinguishes the
        // empty case; without `{{else}}` there is nothing to report.
        if (COLLECTION_BLOCKS.has(name) && node.inverse) {
          instrumentBlock(node);
        }
      },

      MustacheStatement(node: CallNode) {
        const name = nameOf(node.path);
        if (CONDITIONAL_BLOCKS.has(name) && node.params.length > 1) {
          instrumentInlineConditional(node);
        }
      },

      SubExpression(node: CallNode) {
        const name = nameOf(node.path);
        if (CONDITIONAL_BLOCKS.has(name) && node.params.length > 1) {
          instrumentInlineConditional(node);
        }
      },
    };

    return {
      name: 'ember-cli-code-coverage',
      visitor,
    };
  };
}

'use strict';

/**
 * Glimmer AST plugin that instruments templates with coverage markers.
 *
 * Injects {{coverageInit filePath branchMapJSON}} at the template root to
 * register an Istanbul-compatible coverage object in window.__coverage__.
 *
 * Injects {{coverageMark filePath branchId locationId}} at each branch point
 * (if/else, unless, each with else) to record branch hits at runtime.
 *
 * Wraps inline (if cond a b) / (unless cond a) conditions with
 * (coverageCond filePath branchId reversed condition) to track inline branches.
 *
 * Uses camelCase helper names so they work in both loose mode (.hbs, resolved
 * by the Ember resolver which normalizes camelCase -> dash-case) and strict
 * mode (.gjs/.gts, resolved from JS scope via the import plugin).
 */

/**
 * Creates the template coverage AST plugin factory.
 *
 * @param {Object} options
 * @param {string} [options.coverageEnvVar='COVERAGE'] - environment variable to check
 * @returns {Function} Glimmer AST plugin factory (ASTPluginBuilder)
 */
function createTemplateCoveragePlugin(options) {
  const coverageEnvVar = (options && options.coverageEnvVar) || 'COVERAGE';

  // Track branch ID counters per module name so that multiple <template>
  // blocks in the same .gts file get unique, non-colliding branch IDs.
  const moduleBranchCounters = {};

  return function templateCoveragePlugin(env) {
    if (process.env[coverageEnvVar] !== 'true') {
      return { name: 'ember-cli-coverage-noop', visitor: {} };
    }

    const moduleName = (env.meta && env.meta.moduleName) || 'unknown';
    const b = env.syntax.builders;

    let branchId = moduleBranchCounters[moduleName] || 0;
    const branches = {};

    // Block types that represent conditional branching
    const CONDITIONAL_BLOCKS = { if: true, unless: true };

    // Built-in block helpers that always render their body and are NOT
    // component invocations. These should not be instrumented as branches.
    const NON_BRANCH_BLOCKS = {
      let: true,
      with: true,
      'in-element': true,
      '-in-element': true,
    };

    /**
     * Returns true if an ElementNode looks like a component invocation.
     * A component is detected by any of:
     * - Tag starts with an uppercase letter (e.g. <MyComponent>)
     * - Tag contains a dot (e.g. <foo.bar>)
     * - Element has @-prefixed attributes (e.g. <my-thing @value={{1}}>)
     * - Element has block params (e.g. <my-thing as |item|>)
     */
    function isComponentElement(node) {
      const tag = node.tag;
      if (/^[A-Z]/.test(tag) || tag.indexOf('.') !== -1) {
        return true;
      }
      // Check for @-prefixed attributes (component arguments)
      if (
        node.attributes &&
        node.attributes.some(function (attr) {
          return attr.name && attr.name.charAt(0) === '@';
        })
      ) {
        return true;
      }
      // Check for block params (as |...|)
      if (node.blockParams && node.blockParams.length > 0) {
        return true;
      }
      return false;
    }

    function getLoc(node) {
      if (!node || !node.loc) {
        return { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } };
      }
      const loc = node.loc;
      // Support both SourceSpan API (.startPosition/.endPosition) and plain object (.start/.end)
      const start = loc.startPosition || loc.start || { line: 0, column: 0 };
      const end = loc.endPosition || loc.end || { line: 0, column: 0 };
      return {
        start: { line: start.line, column: start.column },
        end: { line: end.line, column: end.column },
      };
    }

    function createCoverageMark(branchIdx, locationIdx) {
      return b.mustache(b.path('coverageMark'), [
        b.string(moduleName),
        b.number(branchIdx),
        b.number(locationIdx),
      ]);
    }

    function createCoverageCondWrapper(branchIdx, reversed, conditionNode) {
      return b.sexpr(b.path('coverageCond'), [
        b.string(moduleName),
        b.number(branchIdx),
        b.boolean(reversed),
        conditionNode,
      ]);
    }

    function instrumentConditionalBlock(node) {
      const blockName = (node.path && node.path.original) || 'block';
      const currentBranchId = branchId++;
      const nodeLoc = getLoc(node);
      const locations = [];

      // Instrument the consequent (main block body)
      if (node.program && node.program.body) {
        const programLoc = getLoc(node.program);
        locations.push({ start: programLoc.start, end: programLoc.end });
        node.program.body.unshift(createCoverageMark(currentBranchId, 0));
      }

      // Instrument the alternate (else block).
      // When there is no explicit {{else}}, we do NOT add an implicit else
      // location. An absent else is treated as an empty block that is always
      // "visited", so Istanbul won't report a phantom "else path not taken".
      if (node.inverse && node.inverse.body) {
        const inverseLoc = getLoc(node.inverse);
        locations.push({ start: inverseLoc.start, end: inverseLoc.end });
        node.inverse.body.unshift(createCoverageMark(currentBranchId, 1));
      }

      branches[currentBranchId] = {
        type: blockName,
        locations: locations,
        loc: nodeLoc,
      };
    }

    function instrumentEachBlock(node) {
      // Only instrument {{#each}} / {{#each-in}} that have an {{else}} clause,
      // since the each body is a loop (not a branch) but "items vs no items" is.
      if (!node.inverse || !node.inverse.body) {
        return;
      }

      const currentBranchId = branchId++;
      const nodeLoc = getLoc(node);
      const locations = [];

      // Main body: list has items
      if (node.program && node.program.body) {
        const programLoc = getLoc(node.program);
        locations.push({ start: programLoc.start, end: programLoc.end });
        node.program.body.unshift(createCoverageMark(currentBranchId, 0));
      }

      // Else body: empty list
      const inverseLoc = getLoc(node.inverse);
      locations.push({ start: inverseLoc.start, end: inverseLoc.end });
      node.inverse.body.unshift(createCoverageMark(currentBranchId, 1));

      branches[currentBranchId] = {
        type: 'each',
        locations: locations,
        loc: nodeLoc,
      };
    }

    /**
     * Instrument an inline conditional: (if cond a b) or (unless cond a b).
     * Wraps the condition with (coverageCond filePath branchId reversed cond)
     * so the helper can record which branch is taken and pass the condition through.
     */
    function instrumentInlineConditional(node) {
      const blockName = node.path && node.path.original;

      // Must have at least 2 params: condition + trueValue
      if (!node.params || node.params.length < 2) {
        return;
      }

      const currentBranchId = branchId++;
      const nodeLoc = getLoc(node);
      const reversed = blockName === 'unless';

      // Point locations at the actual consequent/alternate values for accurate
      // line/column mapping in Istanbul reports.
      // location 0 = consequent value (params[1])
      // location 1 = alternate value (params[2], or implicit undefined at end of expression)
      const consequentLoc = node.params[1] ? getLoc(node.params[1]) : nodeLoc;
      const alternateLoc = node.params[2]
        ? getLoc(node.params[2])
        : { start: nodeLoc.end, end: nodeLoc.end };
      const locations = [
        { start: consequentLoc.start, end: consequentLoc.end },
        { start: alternateLoc.start, end: alternateLoc.end },
      ];

      branches[currentBranchId] = {
        type: 'cond',
        locations: locations,
        loc: nodeLoc,
      };

      // Wrap the condition argument with coverageCond
      node.params[0] = createCoverageCondWrapper(
        currentBranchId,
        reversed,
        node.params[0]
      );
    }

    /**
     * Instrument a curly component block: {{#my-component}}...{{/my-component}}.
     * The block body is an implicit default block (slot) that may or may not
     * be yielded by the component.
     */
    function instrumentCurlyComponentBlock(node) {
      const currentBranchId = branchId++;
      const nodeLoc = getLoc(node);

      // Inject coverageMark at the start of the program body
      node.program.body.unshift(createCoverageMark(currentBranchId, 0));

      // If the component has an inverse ({{else}}), instrument it too
      const programLoc = getLoc(node.program);
      if (node.inverse && node.inverse.body) {
        const inverseLoc = getLoc(node.inverse);
        branches[currentBranchId] = {
          type: 'default-block',
          locations: [
            { start: programLoc.start, end: programLoc.end },
            { start: inverseLoc.start, end: inverseLoc.end },
          ],
          loc: nodeLoc,
        };
        node.inverse.body.unshift(createCoverageMark(currentBranchId, 1));
      } else {
        branches[currentBranchId] = {
          type: 'default-block',
          locations: [
            { start: programLoc.start, end: programLoc.end },
            { start: nodeLoc.end, end: nodeLoc.end },
          ],
          loc: nodeLoc,
        };
      }
    }

    return {
      name: 'ember-cli-code-coverage-template',
      visitor: {
        BlockStatement: function (node) {
          const blockName = node.path && node.path.original;

          if (CONDITIONAL_BLOCKS[blockName]) {
            instrumentConditionalBlock(node);
          } else if (blockName === 'each' || blockName === 'each-in') {
            instrumentEachBlock(node);
          } else if (NON_BRANCH_BLOCKS[blockName]) {
            // Built-in blocks that always render — not branches, skip.
          } else if (blockName && node.program && node.program.body) {
            // Curly component invocation: {{#my-component}}...{{/my-component}}
            // The block body is a default block (slot) that may or may not
            // be yielded by the component. Instrument like a default-block.
            instrumentCurlyComponentBlock(node);
          }
        },

        SubExpression: function (node) {
          const pathName = node.path && node.path.original;
          if (pathName === 'if' || pathName === 'unless') {
            instrumentInlineConditional(node);
          }
        },

        MustacheStatement: function (node) {
          const pathName = node.path && node.path.original;
          // Only instrument inline {{if}} / {{unless}} (with params, not block form)
          // Block form is handled by BlockStatement visitor
          if (
            (pathName === 'if' || pathName === 'unless') &&
            node.params &&
            node.params.length >= 2
          ) {
            instrumentInlineConditional(node);
          }
        },

        ElementNode: function (node) {
          if (!node.tag) {
            return;
          }

          // Named blocks are ElementNodes with tags starting with ':'
          // e.g. <:header>...</:header>, <:body>...</:body>
          if (node.tag.charAt(0) === ':') {
            const currentBranchId = branchId++;
            const nodeLoc = getLoc(node);

            // Inject coverageMark at the start of the named block's children
            if (node.children) {
              node.children.unshift(createCoverageMark(currentBranchId, 0));
            }

            // Istanbul expects branches to have at least 2 locations.
            // Location 0 = rendered (the named block body).
            // Location 1 = not rendered (implicit, zero-width at block end).
            branches[currentBranchId] = {
              type: 'named-block',
              locations: [
                { start: nodeLoc.start, end: nodeLoc.end },
                { start: nodeLoc.end, end: nodeLoc.end },
              ],
              loc: nodeLoc,
            };
            return;
          }

          // Implicit default block: a component invocation with children that
          // are NOT all named blocks.
          if (
            !isComponentElement(node) ||
            !node.children ||
            node.children.length === 0
          ) {
            return;
          }

          // Check whether all children are named blocks. If so, there is no
          // implicit default block to instrument.
          const hasNamedBlock = node.children.some(function (child) {
            return (
              child.type === 'ElementNode' &&
              child.tag &&
              child.tag.charAt(0) === ':'
            );
          });

          // If any child is a named block, all non-whitespace children should
          // be named blocks (Glimmer enforces this). So skip instrumentation
          // to avoid interfering with named block semantics.
          if (hasNamedBlock) {
            return;
          }

          const currentBranchId = branchId++;
          const nodeLoc = getLoc(node);

          // Inject coverageMark at the start of the component's children
          node.children.unshift(createCoverageMark(currentBranchId, 0));

          // Istanbul expects branches to have at least 2 locations.
          // Location 0 = rendered (the default block body).
          // Location 1 = not rendered (implicit, zero-width at block end).
          branches[currentBranchId] = {
            type: 'default-block',
            locations: [
              { start: nodeLoc.start, end: nodeLoc.end },
              { start: nodeLoc.end, end: nodeLoc.end },
            ],
            loc: nodeLoc,
          };
        },

        Template: {
          exit: function (node) {
            // Save the counter so the next <template> in this module
            // continues from where we left off (avoids branchId collisions).
            moduleBranchCounters[moduleName] = branchId;

            if (Object.keys(branches).length > 0) {
              const initNode = b.mustache(b.path('coverageInit'), [
                b.string(moduleName),
                b.string(JSON.stringify(branches)),
              ]);
              node.body.unshift(initNode);
            }
          },
        },
      },
    };
  };
}

/**
 * Build function for ember-cli-htmlbars parallelBabel.
 * Called by setupPlugins in worker threads to reconstruct the AST plugin wrapper.
 * Must return an object with { plugin, name } matching the wrapper format
 * that setupPlugins expects (NOT a bare function).
 */
function buildForParallel(params) {
  return {
    plugin: createTemplateCoveragePlugin(params),
    name: 'ember-cli-code-coverage-template',
  };
}

module.exports = createTemplateCoveragePlugin;
module.exports.createTemplateCoveragePlugin = createTemplateCoveragePlugin;
module.exports.buildForParallel = buildForParallel;

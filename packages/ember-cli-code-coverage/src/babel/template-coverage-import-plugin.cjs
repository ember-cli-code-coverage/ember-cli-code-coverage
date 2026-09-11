/**
 * Babel plugin that injects coverage helper imports into files with
 * strict-mode templates.
 *
 * A strict-mode template — the `<template>` tag in `.gjs`/`.gts`, or an
 * explicit `template()` call — has no resolver: every identifier it
 * references must already be a JS binding in scope. The AST plugin from
 * `ember-cli-code-coverage/glimmer`, run with `strict: true`, emits calls
 * to `coverageInit`/`coverageMark`/`coverageCond` expecting exactly that.
 * This plugin is what puts those bindings there, by detecting a file that
 * imports from `@ember/template-compiler` (the strict-mode compiler) and
 * adding:
 *
 *   import coverageInit from 'ember-cli-code-coverage/helpers/coverage-init';
 *   import coverageMark from 'ember-cli-code-coverage/helpers/coverage-mark';
 *   import coverageCond from 'ember-cli-code-coverage/helpers/coverage-cond';
 *
 * IMPORTANT: This plugin uses the `pre()` hook (not a visitor) to inject
 * imports BEFORE babel-plugin-ember-template-compilation's own `pre()`
 * hook compiles templates and validates scope. Babel runs every plugin's
 * `pre()` hook, in plugin order, before the traversal phase — so this
 * plugin has to be listed BEFORE babel-plugin-ember-template-compilation
 * in the plugins array, or the imports won't exist yet when the template
 * compiler looks for them.
 *
 * NOTE: This file is intentionally plain JavaScript, for the same reason
 * as `gjs-gts-istanbul-ignore-template-plugin.cjs` — Babel plugins are
 * loaded via `require.resolve()` at build time, so they must be directly
 * consumable without a compile step.
 */

'use strict';

const STRICT_TEMPLATE_SOURCE = '@ember/template-compiler';

const HELPER_IMPORTS = [
  {
    local: 'coverageInit',
    source: 'ember-cli-code-coverage/helpers/coverage-init',
  },
  {
    local: 'coverageMark',
    source: 'ember-cli-code-coverage/helpers/coverage-mark',
  },
  {
    local: 'coverageCond',
    source: 'ember-cli-code-coverage/helpers/coverage-cond',
  },
];

/**
 * @param {import('@babel/core')} babel
 * @param {{ coverageEnvVar?: string }} [options]
 * @returns {import('@babel/core').PluginObj}
 */
function templateCoverageImportPlugin(babel, options) {
  const t = babel.types;
  const coverageEnvVar = (options && options.coverageEnvVar) || 'COVERAGE';

  return {
    name: 'ember-cli-code-coverage-template-import',

    pre(file) {
      // Mirrors createTemplateCoveragePlugin()'s own gate: when coverage
      // is off, that AST plugin is a no-op, so these imports would just
      // sit unused in every production build.
      if (process.env[coverageEnvVar] !== 'true') return;

      const body = file.ast.program.body;

      const hasStrictTemplate = body.some(
        (node) =>
          node.type === 'ImportDeclaration' &&
          node.source.value === STRICT_TEMPLATE_SOURCE,
      );

      if (!hasStrictTemplate) return;

      const newImports = [];
      for (const { local, source } of HELPER_IMPORTS) {
        const alreadyImported = body.some(
          (node) =>
            node.type === 'ImportDeclaration' && node.source.value === source,
        );
        if (!alreadyImported) {
          newImports.push(
            t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier(local))],
              t.stringLiteral(source),
            ),
          );
        }
      }

      if (newImports.length === 0) return;

      let lastImportIndex = -1;
      for (let i = 0; i < body.length; i++) {
        if (body[i].type === 'ImportDeclaration') {
          lastImportIndex = i;
        }
      }

      body.splice(lastImportIndex + 1, 0, ...newImports);

      // babel-plugin-ember-template-compilation runs its own traversal in
      // pre() and validates that every identifier the AST plugin emits is
      // an in-scope binding. Without this, it would still see the scope
      // as it was before we spliced in the imports above.
      if (file.path && file.path.scope) {
        file.path.scope.crawl();
      }
    },
  };
}

templateCoverageImportPlugin._parallelBabel = {
  requireFile: __filename,
};

module.exports = templateCoverageImportPlugin;

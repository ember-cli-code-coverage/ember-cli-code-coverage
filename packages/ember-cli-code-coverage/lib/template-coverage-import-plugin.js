'use strict';

/**
 * Babel plugin that injects coverage helper imports into files with
 * strict-mode templates.
 *
 * In strict-mode templates (<template> tag in .gjs/.gts, or template()
 * calls in .ts/.js), helpers must be in JS scope to be referenced.
 * This plugin detects any file that imports from '@ember/template-compiler'
 * and adds:
 *
 *   import coverageInit from 'ember-cli-code-coverage/helpers/coverage-init';
 *   import coverageMark from 'ember-cli-code-coverage/helpers/coverage-mark';
 *   import coverageCond from 'ember-cli-code-coverage/helpers/coverage-cond';
 *
 * so the AST-plugin-injected {{coverageInit}}, {{coverageMark}}, and
 * (coverageCond) invocations can resolve in strict mode.
 *
 * IMPORTANT: This plugin uses the pre() hook (not a visitor) to inject
 * imports BEFORE babel-plugin-ember-template-compilation's pre() hook
 * compiles templates and validates scope. Babel runs all plugins' pre()
 * hooks in plugin order before the traversal phase. This plugin must be
 * listed BEFORE babel-plugin-ember-template-compilation in the plugins array.
 */
function templateCoverageImportPlugin(babel) {
  const t = babel.types;

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

  return {
    name: 'ember-cli-coverage-template-import',

    // Use pre() instead of Program visitor so imports are injected before
    // babel-plugin-ember-template-compilation's pre() compiles templates.
    // Babel runs pre() hooks in plugin order, so as long as this plugin
    // is listed first, imports are in scope when templates are compiled.
    pre(file) {
      const body = file.ast.program.body;

      // Check if template() is imported from @ember/template-compiler.
      // This covers .gjs/.gts files (processed by content-tag) AND
      // .ts/.js files that use template() directly for strict-mode templates.
      const hasTemplateImport = body.some(
        (node) =>
          node.type === 'ImportDeclaration' &&
          node.source.value === '@ember/template-compiler'
      );

      if (!hasTemplateImport) {
        return;
      }

      // Collect which imports are missing
      const newImports = [];
      for (const { local, source } of HELPER_IMPORTS) {
        const alreadyImported = body.some(
          (node) =>
            node.type === 'ImportDeclaration' && node.source.value === source
        );
        if (!alreadyImported) {
          newImports.push(
            t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier(local))],
              t.stringLiteral(source)
            )
          );
        }
      }

      if (newImports.length > 0) {
        // Insert after existing imports
        let lastImportIndex = -1;
        for (let i = 0; i < body.length; i++) {
          if (body[i].type === 'ImportDeclaration') {
            lastImportIndex = i;
          }
        }

        for (let j = newImports.length - 1; j >= 0; j--) {
          body.splice(lastImportIndex + 1, 0, newImports[j]);
        }

        // Force Babel to rebuild its scope analysis so that
        // babel-plugin-ember-template-compilation (which runs its own
        // traversal in pre()) can see our new imports as in-scope bindings.
        // Without this, strict-mode template compilation fails because
        // the scope was built before our imports were added.
        if (file.path && file.path.scope) {
          file.path.scope.crawl();
        }
      }
    },
  };
}

templateCoverageImportPlugin._parallelBabel = {
  requireFile: __filename,
};

module.exports = templateCoverageImportPlugin;

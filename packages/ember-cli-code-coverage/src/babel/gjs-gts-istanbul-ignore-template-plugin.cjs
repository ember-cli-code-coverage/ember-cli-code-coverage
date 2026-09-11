/**
 * Babel plugin that adds `istanbul ignore next` comments to GJS/GTS
 * template() calls from @ember/template-compiler.
 *
 * When gjs/gts is compiled, it produces template() calls with a synthetic
 * eval() method. Istanbul would try to instrument this eval(), skewing
 * coverage results. This plugin prevents that by marking those calls
 * with ignore comments before Istanbul's plugin runs.
 *
 * NOTE: This file is intentionally plain JavaScript. Babel plugins are
 * loaded via require.resolve() at build time, so they must be directly
 * consumable without a compile step.
 */

'use strict';

/** @type {import('@babel/traverse').Visitor} */
const gjsGtsTemplateIgnoreVisitor = {
  CallExpression(path) {
    const { node } = path;
    const { callee } = node;

    // content-tag may use template1, template2, etc. for name collisions
    if (!/^template\d*$/.test(callee.name)) {
      return;
    }

    const callScopeBinding = path.scope.getBinding(callee.name);

    if (
      callScopeBinding &&
      callScopeBinding.kind === 'module' &&
      callScopeBinding.path.parent?.source?.value === '@ember/template-compiler'
    ) {
      const babelIgnoreComment = {
        type: 'CommentBlock',
        value: ' istanbul ignore next ',
      };

      const statement = path.findParent((p) => p.isStatement());

      if (!statement) return;

      if (!statement.node.leadingComments) {
        statement.node.leadingComments = [];
      }

      // Avoid inserting duplicate ignore comments
      const alreadyIgnored = statement.node.leadingComments.some(
        (c) => c.value.trim() === 'istanbul ignore next',
      );
      if (alreadyIgnored) return;

      statement.node.leadingComments.push(babelIgnoreComment);
    }
  },
};

module.exports = function gjsGtsIstanbulIgnoreTemplatePlugin() {
  return {
    visitor: {
      Program: {
        enter(path, state) {
          const inputSourceMap = state.file.inputMap?.sourcemap;

          if (!inputSourceMap) {
            return;
          }

          const isGjsGtsFile = inputSourceMap.sources.some((source) =>
            /\.g[tj]s$/.test(source),
          );

          if (isGjsGtsFile) {
            // Early traverse ensures this runs before Istanbul's plugin
            path.traverse(gjsGtsTemplateIgnoreVisitor, state);
          }
        },
      },
    },
  };
};

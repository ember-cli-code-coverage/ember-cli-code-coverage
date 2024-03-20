/**
 * When gjs/gts is converted to js it looks like this
 *
 * @example
 * template(`
 *   <div>
 *    template code
 *   </div>`
 * , {
 *   eval() {
 *     return eval(arguments[0]);
 *   }
 *});
 *
 * The problem is Istanbul's babel plugin will try to instrument the `eval` method which can skew coverage results.
 * In order to avoid this we add this plugin to add Istanbul ignore comments above `eval` to make sure it won't be instrumented by babel
 */
const gjsGtsTemplateIgnoreVisitor = {
  CallExpression(path) {
    const { node } = path;
    let { callee } = node;

    // if there is already a `template` variable in scope, content-tag will use `template1` local name and so on.
    if (!/^template\d*$/.test(callee.name)) {
      return;
    }

    const callScopeBinding = path.scope.getBinding(callee.name);

    if (
      callScopeBinding.kind === 'module' &&
      callScopeBinding.path.parent.source.value === '@ember/template-compiler'
    ) {
      const babelIgnoreComment = {
        type: 'CommentBlock',
        value: ' istanbul ignore next ',
      };

      if (!path.findParent((path) => path.isStatement()).node.leadingComments) {
        path.findParent((path) => path.isStatement()).node.leadingComments = [];
      }
      path
        .findParent((path) => path.isStatement())
        .node.leadingComments.push(babelIgnoreComment);
    }
  },
};

module.exports = function () {
  return {
    visitor: {
      Program: {
        enter(path, state) {
          const inputSourceMap = state.file.inputMap?.sourcemap;

          if (!inputSourceMap) {
            return;
          }

          const sourcePaths = inputSourceMap.sources;

          const isGjsGtsFile = sourcePaths.some((source) =>
            source.match(/\.g[tj]s$/)
          );

          if (isGjsGtsFile) {
            // We need to do early traverse to make sure this runs before istanbuls plugin
            path.traverse(gjsGtsTemplateIgnoreVisitor, state);
          }
        },
      },
    },
  };
};

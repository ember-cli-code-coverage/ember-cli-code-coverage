'use strict';

var path = require('path');
var TestExclude = require('test-exclude');
var TemplateCoverage = require('./template-coverage');

const coveragehelpers = new WeakSet();
const statementsToInsert = new WeakMap();

module.exports = function (params) {
  let appRoot = params.root || process.cwd();
  const _exclude = new TestExclude({
    cwd: appRoot,
    include: '**/*.hbs',
    exclude: params.exclude || [],
    extension: ['hbs'],
  });

  return function (options) {
    let self = {};
    self.options = options;
    self.syntax = options.syntax;
    let moduleName = options.meta.moduleName;

    if (
      !moduleName ||
      (moduleName.endsWith('-test.js') && moduleName.includes('tests/')) ||
      (moduleName && !_exclude.shouldInstrument(moduleName))
    ) {
      return {
        visitor: {},
      };
    }

    self.fullPath = path.join(appRoot, moduleName);
    self.isTemplateTag =
      moduleName.endsWith('.js') && !moduleName.includes('-test.js');

    if (self.isTemplateTag) {
      self.fullPath = self.fullPath.replace(/\.js$/, '.gjs');
    }

    self.cov = new TemplateCoverage(self.fullPath, options.contents);

    self.currentContainer = () => {
      return self._containerStack[self._containerStack.length - 1];
    };

    /* ----------------------------- HELPER METHODS ----------------------------- */
    self.insertStatementHelper = (node) => {
      let container = self.currentContainer();
      let children = container.body || container.children;
      let index = children ? children.indexOf(node) : 0;

      let helper = self.createHelper(null, {
        statement: self.cov._currentStatement,
      });

      if (!statementsToInsert.has(container)) {
        statementsToInsert.set(container, []);
      }

      statementsToInsert.get(container).unshift({
        helper,
        index,
      });
    };

    self.processStatementsToInsert = (node) => {
      if (statementsToInsert.has(node)) {
        statementsToInsert.get(node).forEach((statement) => {
          let { helper, index } = statement;

          let children = node.children || node.body;
          children && children.splice(index, 0, helper);
        });
      }
    };

    self.insertBranchHelper = (
      branchNode,
      parentNode,
      branchIndex,
      inline,
      params
    ) => {
      let helper = self.createHelper(
        params,
        {
          branch: self.cov._currentBranch,
          condition: branchIndex,
        },
        inline
      );

      if (inline) {
        return helper;
      }

      branchNode.body.unshift(helper);
    };

    self.handleStatement = (node) => {
      if (coveragehelpers.has(node)) {
        return;
      }

      if (node.type === 'TextNode') {
        return;
      }

      // cannot process statements without a loc
      if (!node.loc) {
        return;
      }

      if (node.loc.start.line == null) {
        return;
      }

      let current = self.currentContainer();
      if (current.type === 'AttrNode' && node.params?.length === 0) {
        return;
      }

      if (
        node.path &&
        node.path.type == 'PathExpression' &&
        node.path.original.match(/if|unless/) &&
        node.params.length > 1
      ) {
        // if else statement
        let branchIndex = self.cov.newBranch(node);
        self.cov.newBranchPath(branchIndex, node.params[1]);
        let helper = self.insertBranchHelper(node.program, node, 0, true, [
          node.params[1],
        ]);
        node.params[1] = helper;

        if (node.params[2]) {
          self.cov.newBranchPath(branchIndex, node.params[2]);
          let helper = self.insertBranchHelper(node.program, node, 1, true, [
            node.params[2],
          ]);
          node.params[2] = helper;
        }
      } else {
        if (node.tag?.startsWith(':') || node.path?.original === 'get') {
          return;
        }

        self.cov.newStatement(node);

        // helper
        if (
          (current.type === 'AttrNode' || current.type === 'ConcatStatement') &&
          node.type !== 'SubExpression' &&
          (node.params.length || node.hash.pairs.length)
        ) {
          const helper = self.createHelper(null, {
            statement: self.cov._currentStatement,
          });
          helper.params = [b.sexpr(node.path, node.params)];
          return helper;
        }

        self.insertStatementHelper(node);
      }
    };

    self.handleBlock = (node) => {
      // cannot process blocks without a loc
      if (!node.loc) {
        return;
      }

      if (coveragehelpers.has(node)) {
        return;
      }

      self.handleStatement(node);

      if (node.type === 'BlockStatement') {
        let branchIndex = self.cov.newBranch(node);
        self.cov.newBranchPath(branchIndex, node.program);
        self.insertBranchHelper(node.program, node, 0);

        if (node.inverse) {
          self.cov.newBranchPath(branchIndex, node.inverse);
          self.insertBranchHelper(node.inverse, node, 1);
        }
      }
    };

    self.createHelper = (params, hash, isInline) => {
      const b = self.syntax.builders;

      if (hash) {
        hash = b.hash(
          Object.keys(hash).map((key) => b.pair(key, b.string(hash[key])))
        );
        hash.pairs.push(b.pair('path', b.string(self.fullPath)));
      }

      let helperPath = self.options.meta.jsutils.bindImport(
        'ember-cli-code-coverage/test-support',
        'emberCliCodeCoverageIncrement',
        path,
        { nameHint: 'emberCliCodeCoverageIncrement' }
      );

      let helper = b[isInline ? 'sexpr' : 'mustache'](
        helperPath,
        (isInline
          ? params
          : params && params.map((p) => b.string(JSON.stringify(p)))) || [],
        hash
      );

      coveragehelpers.add(helper);
      return helper;
    };

    let handleStatement = (node) => self.handleStatement(node);
    const b = self.syntax.builders;

    return {
      name: 'template-instrumenter',
      visitor: {
        Template: {
          enter: (node) => {
            if (!self._topLevelProgram) {
              self._topLevelProgram = node;
              self._containerStack = [node];
            } else {
              self._containerStack.push(node);
            }
          },
          exit: (node) => {
            self.processStatementsToInsert(node);
            if (node === self._topLevelProgram) {
              self.options.meta.jsutils.emitExpression(() => {
                return `window.__coverage__["${
                  self.cov.data.path
                }"] ??= ${JSON.stringify(self.cov.data)};`;
              });
            }

            self._containerStack.pop(node);
          },
        },
        ElementNode: {
          enter: (node) => {
            self.handleBlock(node);
            self._containerStack.push(node);
          },
          exit: (node) => {
            self.processStatementsToInsert(node);
            self._containerStack.pop();
          },
        },
        BlockStatement: {
          enter: (node) => {
            self.handleBlock(node);
            self._containerStack.push(node);
          },
          exit: (node) => {
            self.processStatementsToInsert(node);
            self._containerStack.pop();
          },
        },
        Block: {
          enter: (node) => {
            self._containerStack.push(node);
          },
          exit: (node) => {
            self.processStatementsToInsert(node);
            self._containerStack.pop();
          },
        },
        MustacheStatement: handleStatement,
        TextNode: handleStatement,
        ElementModifierStatement: (node) => {
          if (node.path.original === 'on') {
            const helper = self.createHelper(
              [node.params[1]],
              {
                action: true,
                statement: self.cov.newStatement(node),
              },
              true
            );
            node.params[1] = helper;
          }
        },
        ConcatStatement: {
          enter: (node) => {
            self._containerStack.push(node);
          },
          exit: () => {
            self._containerStack.pop();
          },
        },
        AttrNode: {
          enter: (node) => {
            if (node.value && node.value.type === 'MustacheStatement') {
              self._containerStack.push(node);
            }
          },
          exit: (node) => {
            if (node.value && node.value.type === 'MustacheStatement') {
              self._containerStack.pop();
            }
          },
        },
      },
    };
  };
};

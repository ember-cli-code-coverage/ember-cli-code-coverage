import gjsGtsIstanbulIgnoreTemplatePlugin from '../packages/ember-cli-code-coverage/lib/gjs-gts-istanbul-ignore-template-plugin';
import babel from '@babel/core';
import { expect, describe, it } from 'vitest';


describe('gjs-gts-ignore-template-plugin', () => {
    it('it adds istanbul ignore comment before "template" invocation if template is imported from "@ember/template-compiler"', async () => {
        const example = `
        import { template } from "@ember/template-compiler";
        import { on } from '@ember/modifier';

        let counter = 0;

        function bar() {
            counter++;
            console.log(counter);
        }

        export default template(\`
          <button {{on "click" bar}}>
           increment
          </button>
        \`, {
            eval () {
                return eval(arguments[0]);
            }
        });
        `;

        const {code} = babel.transform(example, {plugins: [gjsGtsIstanbulIgnoreTemplatePlugin], filename: 'some-file.gjs'});

        expect(code).toMatchSnapshot();
    });
  
    it('it does not add istanbul ignore comment before "template" invocation if template is not imported from "@ember/template-compiler"', async () => {
        const example = `
        import { template } from "@ember/template-compiler";
        import { on } from '@ember/modifier';

        let counter = 0;

        function bar() {
            const template = () => {};
            template();
            counter++;
            console.log(counter);
        }

        export default template(\`
          <button {{on "click" bar}}>
           increment
          </button>
        \`, {
            eval () {
                return eval(arguments[0]);
            }
        });
        `;

        const {code} = babel.transform(example, {plugins: [gjsGtsIstanbulIgnoreTemplatePlugin], filename: 'some-file.gjs'});

        expect(code).toMatchSnapshot();
    });

    it('it skips files if it`s a regular js file', async () => {
        const example = `
        import { template } from "@ember/template-compiler";
        import { on } from '@ember/modifier';

        let counter = 0;

        function bar() {
            const template = () => {};
            template();
            counter++;
            console.log(counter);
        }

        export default template(\`
          <button {{on "click" bar}}>
           increment
          </button>
        \`, {
            eval () {
                return eval(arguments[0]);
            }
        });
        `;

        const {code} = babel.transform(example, {plugins: [gjsGtsIstanbulIgnoreTemplatePlugin], filename: 'some-file.js'});

        expect(code).toMatchSnapshot();
    });

    it('it skips files if it`s a regular ts file', async () => {
        const example = `
        import { template } from "@ember/template-compiler";
        import { on } from '@ember/modifier';

        let counter = 0;

        function bar() {
            const template = () => {};
            template();
            counter++;
            console.log(counter);
        }

        export default template(\`
          <button {{on "click" bar}}>
           increment
          </button>
        \`, {
            eval () {
                return eval(arguments[0]);
            }
        });
        `;

        const {code} = babel.transform(example, {plugins: [gjsGtsIstanbulIgnoreTemplatePlugin], filename: 'some-file.ts'});

        expect(code).toMatchSnapshot();
    });
  });
  
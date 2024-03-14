import gjsGtsIstanbulIgnoreTemplatePlugin from '../packages/ember-cli-code-coverage/lib/gjs-gts-istanbul-ignore-template-plugin';
import babel from '@babel/core';
import { expect, describe, it } from 'vitest';
import { Preprocessor } from 'content-tag';

let processor = new Preprocessor();

describe('gjs-gts-ignore-template-plugin', () => {
    it('it adds istanbul ignore comment before "template" invocation if template is imported from "@ember/template-compiler"', async () => {
        const example = processor.process(`import { on } from '@ember/modifier';

        let counter = 0;

        function bar() {
            counter++;
            console.log(counter);
        }

        <template>
          <button {{on "click" bar}}>
           increment
          </button>
        </template>`, { inline_source_map: true, filename: 'my-app/components/bar.gjs' });

        const {code} = babel.transform(example, {plugins: [gjsGtsIstanbulIgnoreTemplatePlugin], filename: 'some-file.gjs'});

        expect(code).toMatchSnapshot();
    });
  
    it('it does not add istanbul ignore comment before "template" invocation if template is not imported from "@ember/template-compiler"', async () => {
        const example = processor.process(`import { on } from '@ember/modifier';

        let counter = 0;

        function bar() {
            const template = ()=>{};
            template();
            counter++;
            console.log(counter);
        }

        <template>
          <button {{on "click" bar}}>
           increment
          </button>
        </template>`, { inline_source_map: true, filename: 'my-app/components/bar.gjs' });

        const {code} = babel.transform(example, {plugins: [gjsGtsIstanbulIgnoreTemplatePlugin], filename: 'some-file.gjs'});

        expect(code).toMatchSnapshot();
    });

    it('it skips files if it`s a regular js file', async () => {
        const example = processor.process(`import { on } from '@ember/modifier';

        let counter = 0;

        function bar() {
            counter++;
            console.log(counter);
        }

        <template>
          <button {{on "click" bar}}>
           increment
          </button>
        </template>`, { inline_source_map: true, filename: 'my-app/components/bar.js' });

        const {code} = babel.transform(example, {plugins: [gjsGtsIstanbulIgnoreTemplatePlugin], filename: 'some-file.js'});

        expect(code).toMatchSnapshot();
    });

    it('it skips files if it`s a regular ts file', async () => {
        const example = processor.process(`import { on } from '@ember/modifier';

        let counter = 0;

        function bar() {
            counter++;
            console.log(counter);
        }

        <template>
          <button {{on "click" bar}}>
           increment
          </button>
        </template>`, { inline_source_map: true, filename: 'my-app/components/bar.ts' });

        const {code} = babel.transform(example, {plugins: [gjsGtsIstanbulIgnoreTemplatePlugin], filename: 'some-file.ts'});

        expect(code).toMatchSnapshot();
    });
  });
  
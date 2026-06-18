import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { on } from '@ember/modifier';

export default class Foo extends Component<{ Element: HTMLButtonElement }> {
  @tracked foo = 0;

  @action
  increment() {
    this.foo++;
    console.log(this.foo);
  }

  <template>
    <button {{on "click" this.increment}}>
      increment
    </button>
  </template>
}

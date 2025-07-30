import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AddonComponentComponent extends Component {
  data = [1, 2, 3];

  @tracked condition = false;

  @action
  clickAction() {
    this.condition = !this.condition;
  }
}

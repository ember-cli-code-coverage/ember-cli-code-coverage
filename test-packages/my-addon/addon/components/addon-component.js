import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class AddonComponentComponent extends Component {
    data = [1, 2, 3]

    condition = false

    @action
    clickAction() {}
}

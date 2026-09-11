import { on } from '@ember/modifier';

let counter = 0;

export const baz = <template>
  hello world
  <button type="button" {{on "click" bar}}>
    increment
  </button>
</template>;

function bar() {
  counter++;
  console.log(counter);
}

<template>
  <button type="button" {{on "click" bar}}>
    increment
  </button>
</template>

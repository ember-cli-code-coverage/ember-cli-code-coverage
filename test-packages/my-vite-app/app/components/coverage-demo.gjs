<template>
  <div class="block">
    {{#if @flag}}
      block-then
    {{else}}
      block-else
    {{/if}}
  </div>

  <div class="no-else">
    {{#if @flag}}
      then-only
    {{/if}}
  </div>

  <div class="inline">{{if @flag "inline-then" "inline-else"}}</div>

  <div class="unless">
    {{#unless @flag}}
      unless-body
    {{/unless}}
  </div>

  <ul class="list">
    {{#each @items as |item|}}
      <li>{{item}}</li>
    {{else}}
      <li>empty</li>
    {{/each}}
  </ul>
</template>

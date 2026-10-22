<script lang="ts">
  import Card from './Card.svelte';
  export let items: string[] = [];
  let count = 0;
  $: doubled = count * 2;
</script>

<button on:click={() => count++} class:active={count > 0}>{count}</button>
{#if items.length > 0}
  {#each items as item, i (item)}
    <Card {item} bind:value={count} />
  {:else}
    <p>none</p>
  {/each}
{:else if count > 5}
  <p>many</p>
{/if}
{#await promise then v}{v}{/await}
{@const total = count + 1}
<div>{@html body}</div>
<p>{@html sanitize(intro)}</p>
<style>
  button { color: red; }
</style>

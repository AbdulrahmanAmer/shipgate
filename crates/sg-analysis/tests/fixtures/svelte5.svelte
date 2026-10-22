<script lang="ts">
  let { items, onpick }: { items: string[]; onpick: (s: string) => void } = $props();
  let count = $state(0);
  let doubled = $derived(count * 2);
  $effect(() => { console.log(count); });
</script>

{#snippet row(item: string)}
  <li onclick={() => onpick(item)}>{item}</li>
{/snippet}

<ul>
  {#each items as item (item)}
    {@render row(item)}
  {/each}
</ul>
<button {onclick} class={["a", { b: count > 1 }]}>{count}</button>
{#key count}<p>{@html body}</p>{/key}
<svelte:head><title>x</title></svelte:head>
<input bind:value={count} use:action transition:fade={{ duration: 100 }} />

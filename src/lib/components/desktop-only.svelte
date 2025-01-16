<script lang="ts">
  import { onMount } from 'svelte';
  
  const MINIMUM_WIDTH = 1024; // Adjust this value as needed
  let isDesktop = true;
  
  function checkWidth() {
    isDesktop = window.innerWidth >= MINIMUM_WIDTH;
  }
  
  onMount(() => {
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  });
</script>

{#if isDesktop}
  <slot />
{:else}
  <div class="flex min-h-screen items-center justify-center p-4">
    <div class="max-w-md text-center">
      <h2 class="text-2xl font-bold">Desktop Only</h2>
      <p class="mt-2 text-muted-foreground">
        Clairvoyance is currently optimized for desktop use only. Please access this application on a device with a larger screen.
      </p>
    </div>
  </div>
{/if} 
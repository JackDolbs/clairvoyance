<script lang="ts">
    import { fade } from 'svelte/transition';
</script>

<div 
    class="p-6"
    in:fade={{ duration: 200 }}
>
    <slot />
</div> 
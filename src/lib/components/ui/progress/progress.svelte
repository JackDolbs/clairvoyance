<script lang="ts">
    export let value: number | undefined = undefined;
    export let max: number = 100;
</script>

<div class="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
    {#if value !== undefined}
        <div
            class="h-full w-full flex-1 bg-primary transition-all duration-500"
            style:transform="translateX(-{100 - ((value / max) * 100)}%)"
        ></div>
    {:else}
        <div
            class="animate-indeterminate h-full w-[50%] bg-primary"
        ></div>
    {/if}
</div>

<style>
    @keyframes indeterminate {
        0% {
            transform: translateX(-100%);
        }
        50% {
            transform: translateX(0%);
        }
        100% {
            transform: translateX(100%);
        }
    }

    .animate-indeterminate {
        animation: indeterminate 1.5s infinite ease-in-out;
    }
</style> 
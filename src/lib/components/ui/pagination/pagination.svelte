<script lang="ts">
	export let currentPage: number;
	export let totalPages: number;
	export let onPageChange: (page: number) => void;
</script>

<div class="flex items-center gap-1">
	{#each Array(totalPages) as _, i}
		<div 
			role="button"
			tabindex="0"
			on:click={() => onPageChange(i)}
			on:keydown={(e) => e.key === 'Enter' && onPageChange(i)}
			class="size-1.5 rounded-full transition-colors duration-200 {currentPage === i ? 'bg-foreground' : 'bg-muted-foreground/30'} hover:bg-muted-foreground/60 cursor-pointer"
			aria-current={currentPage === i}
		/>
	{/each}
</div>

<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { X } from 'lucide-svelte';
    import { getContext } from 'svelte';

    interface NotificationItem {
        title: string;
        description: string;
        url: string;
    }

    const { items } = $props<{ items: NotificationItem[] }>();

    let visibleCards = $state(Array.from({ length: items.length }, (_, i) => i));

    function dismissCard(index: number) {
        visibleCards = visibleCards.filter(i => i !== index);
    }
</script>

<div class="relative h-[120px]">
    {#if visibleCards.length > 0}
        {#each visibleCards as cardIndex (cardIndex)}
            {@const item = items[cardIndex]}
            <Card.Root 
                class="hover:bg-gray-100 transition-all absolute w-full border-l-4 border-l-amber-400/60
                    {cardIndex === visibleCards[visibleCards.length - 1] ? 'z-20 rotate-0 scale-100 shadow-sm' : 
                    cardIndex === visibleCards[visibleCards.length - 2] ? 'z-10 -translate-y-2 scale-[0.98] opacity-90' :
                    cardIndex === visibleCards[visibleCards.length - 3] ? 'z-10 -translate-y-4 scale-[0.96] opacity-80' :
                    'z-0 -rotate-4 scale-[0.96] opacity-80'}"
            >
                <div class="relative bg-gradient-to-r from-amber-50/50 to-transparent">
                    <button
                        class="absolute right-1 top-1 p-2 rounded-full hover:bg-gray-200 transition-colors"
                        onclick={() => dismissCard(cardIndex)}
                    >
                        <X class="w-4 h-4" />
                        <span class="sr-only">Dismiss</span>
                    </button>
                    <a href={item.url} class="block p-4">
                        <Card.Header class="p-0">
                            <Card.Title class="flex items-center gap-2 text-sm font-medium">
                                {item.title}
                            </Card.Title>
                            <Card.Description class="text-xs mt-1">
                                {item.description}
                            </Card.Description>
                        </Card.Header>
                    </a>
                </div>
            </Card.Root>
        {/each}
    {:else}
        <Card.Root class="absolute w-full bg-neutral-100/50 border-dashed">
            <div class="p-4">
                <Card.Header class="p-0">
                    <Card.Title class="text-sm font-medium text-muted-foreground">
                        No new notifications
                    </Card.Title>
                    <Card.Description class="text-xs mt-1 text-muted-foreground/75">
                        Check back later for updates and announcements
                    </Card.Description>
                </Card.Header>
            </div>
        </Card.Root>
    {/if}
</div> 
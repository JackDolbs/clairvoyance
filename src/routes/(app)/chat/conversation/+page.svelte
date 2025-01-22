<script lang="ts">
    import PageContent from "$lib/components/page-content.svelte";
    import { chatStore, type ChatConversation } from '$lib/stores/chat';
    import { Search } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import ConversationFilters from "$lib/components/chat/conversation-filters.svelte";
    import ConversationSort from "$lib/components/chat/conversation-sort.svelte";
    import ConversationCard from "$lib/components/chat/conversation-card.svelte";

    let conversations = $state<ChatConversation[]>([]);
    let searchQuery = $state('');
    let sortBy = $state<'newest' | 'oldest'>('newest');
    let dateFilter = $state<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
    let dateRange = $state<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
    let typeFilters = $state<Set<string>>(new Set());
    let groupBy = $state<'none' | 'date' | 'context'>('none');
    
    chatStore.subscribe(value => conversations = value);

    // Computed conversations with search and sort
    const filteredConversations = $derived(
        conversations
            .filter(conv => {
                // Search filter
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    if (!conv.title.toLowerCase().includes(query) &&
                        !conv.messages.some(msg => msg.content.toLowerCase().includes(query))) {
                        return false;
                    }
                }

                // Date filter
                if (dateFilter !== 'all') {
                    const convDate = conv.lastUpdated;
                    if (dateFilter === 'custom' && dateRange.from && dateRange.to) {
                        if (convDate < dateRange.from || convDate > dateRange.to) return false;
                    } else {
                        const now = new Date();
                        const daysDiff = (now.getTime() - convDate.getTime()) / (1000 * 3600 * 24);

                        if (dateFilter === 'today' && daysDiff > 1) return false;
                        if (dateFilter === 'week' && daysDiff > 7) return false;
                        if (dateFilter === 'month' && daysDiff > 30) return false;
                    }
                }

                // Context type filter
                if (typeFilters.size > 0) {
                    if (!conv.contexts.some(ctx => typeFilters.has(ctx))) return false;
                }

                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'newest') {
                    return b.lastUpdated.getTime() - a.lastUpdated.getTime();
                }
                return a.lastUpdated.getTime() - b.lastUpdated.getTime();
            })
    );

    function formatTime(date: Date) {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }).format(date);
    }

    function formatDate(date: Date) {
        return new Intl.DateTimeFormat('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: 'numeric'
        }).format(date);
    }

    function toggleTypeFilter(type: string) {
        if (typeFilters.has(type)) {
            typeFilters.delete(type);
        } else {
            typeFilters.add(type);
        }
        typeFilters = typeFilters; // trigger reactivity
    }
</script>

<PageContent>
    <!-- Header -->
    <div class="flex items-center justify-between gap-4 mb-6">
        <h1 class="font-orbitron text-2xl font-semibold tracking-wide">
            Chat History
        </h1>
    </div>

    <!-- Search and Controls -->
    <div class="flex gap-3 mb-6">
        <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
                type="text"
                placeholder="Search conversations..."
                class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                bind:value={searchQuery}
            />
        </div>
        
        <ConversationFilters
            bind:dateFilter
            bind:dateRange
            bind:typeFilters
            on:clearFilters={() => {
                dateFilter = 'all';
                dateRange = { from: undefined, to: undefined };
                typeFilters.clear();
                typeFilters = typeFilters;
            }}
        />

        <ConversationSort bind:sortBy />
    </div>

    <!-- Conversation List -->
    <div class="w-full">
        {#if filteredConversations.length === 0}
            <div class="text-left py-5">
                {#if searchQuery}
                    <p class="text-muted-foreground">No conversations match your search</p>
                    <p class="text-sm text-muted-foreground mt-1">
                        Try adjusting your search terms
                    </p>
                {:else}
                    <p class="text-muted-foreground">No conversations yet</p>
                    <p class="text-sm text-muted-foreground mt-1">
                        Start a new chat to begin your conversation history
                    </p>
                {/if}
            </div>
        {:else}
            <div class="space-y-5">
                {#each filteredConversations as conversation}
                    <ConversationCard {conversation} />
                {/each}
            </div>
        {/if}
    </div>
</PageContent> 
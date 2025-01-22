<script lang="ts">
    import PageContent from "$lib/components/page-content.svelte";
    import { chatStore, type ChatConversation } from '$lib/stores/chat';
    import { goto } from "$app/navigation";
    import { Search, SlidersHorizontal, Calendar, Database, FileText } from "lucide-svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Button } from "$lib/components/ui/button";

    let conversations = $state<ChatConversation[]>([]);
    let searchQuery = $state('');
    let sortBy = $state<'newest' | 'oldest'>('newest');
    let dateFilter = $state<'all' | 'today' | 'week' | 'month'>('all');
    let typeFilters = $state<Set<string>>(new Set());
    
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
                    const now = new Date();
                    const convDate = conv.lastUpdated;
                    const daysDiff = (now.getTime() - convDate.getTime()) / (1000 * 3600 * 24);

                    if (dateFilter === 'today' && daysDiff > 1) return false;
                    if (dateFilter === 'week' && daysDiff > 7) return false;
                    if (dateFilter === 'month' && daysDiff > 30) return false;
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

    <!-- Full Width Search and Sort Bar -->
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
        
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <Button variant="outline" size="sm" class="gap-2">
                    <SlidersHorizontal class="w-4 h-4" />
                    Sort
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
                <DropdownMenu.RadioGroup value={sortBy} onValueChange={(value) => sortBy = value}>
                    <DropdownMenu.RadioItem value="newest">
                        Newest First
                    </DropdownMenu.RadioItem>
                    <DropdownMenu.RadioItem value="oldest">
                        Oldest First
                    </DropdownMenu.RadioItem>
                </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </div>

    <!-- Split Content Area -->
    <div class="flex gap-8">
        <!-- Conversation Cards -->
        <div class="max-w-3xl flex-1">
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
                        <button
                            class="w-full px-6 py-4 hover:bg-muted/50 rounded-xl transition-colors text-left group border bg-card"
                            onclick={() => goto(`/chat/conversation/${conversation.id}`)}
                        >
                            <div class="flex justify-between gap-4">
                                <div class="flex-1">
                                    <span class="font-medium text-base">{conversation.title}</span>
                                    <p class="text-sm text-muted-foreground mt-2 line-clamp-2">
                                        {conversation.messages[conversation.messages.length - 1]?.content || 'Empty conversation'}
                                    </p>
                                </div>
                                <div class="flex flex-col items-end justify-center shrink-0">
                                    <span class="text-xs text-muted-foreground">
                                        {formatDate(conversation.lastUpdated)}
                                    </span>
                                    <span class="text-xs text-muted-foreground">
                                        {formatTime(conversation.lastUpdated)}
                                    </span>
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>

        <!-- Filter Sidebar -->
        <div class="w-64 shrink-0">
            <div class="sticky top-6 space-y-6">
                <!-- Time Period Filter -->
                <div class="space-y-3">
                    <h3 class="text-sm font-medium flex items-center gap-2">
                        <Calendar class="w-4 h-4" />
                        Time Period
                    </h3>
                    <div class="space-y-2">
                        {#each [
                            { value: 'all', label: 'All Time' },
                            { value: 'today', label: 'Today' },
                            { value: 'week', label: 'Past Week' },
                            { value: 'month', label: 'Past Month' }
                        ] as option}
                            <button
                                class="w-full px-3 py-1.5 text-sm text-left rounded-md transition-colors {dateFilter === option.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'}"
                                onclick={() => dateFilter = option.value}
                            >
                                {option.label}
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Context Type Filter -->
                <div class="space-y-3">
                    <h3 class="text-sm font-medium flex items-center gap-2">
                        <Database class="w-4 h-4" />
                        Context Type
                    </h3>
                    <div class="space-y-2">
                        {#each [
                            { value: 'database', label: 'Database', icon: Database },
                            { value: 'file', label: 'Files', icon: FileText }
                        ] as option}
                            <button
                                class="w-full px-3 py-1.5 text-sm text-left rounded-md transition-colors flex items-center gap-2 {typeFilters.has(option.value) ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'}"
                                onclick={() => toggleTypeFilter(option.value)}
                            >
                                <svelte:component this={option.icon} class="w-3 h-3" />
                                {option.label}
                            </button>
                        {/each}
                    </div>
                </div>

                {#if dateFilter !== 'all' || typeFilters.size > 0}
                    <button
                        class="w-full px-3 py-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                        onclick={() => {
                            dateFilter = 'all';
                            typeFilters.clear();
                            typeFilters = typeFilters;
                        }}
                    >
                        Clear Filters
                    </button>
                {/if}
            </div>
        </div>
    </div>
</PageContent> 
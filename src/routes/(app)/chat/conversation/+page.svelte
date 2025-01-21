<script lang="ts">
    import PageContent from "$lib/components/page-content.svelte";
    import { chatStore, type ChatConversation } from '$lib/stores/chat';
    import { goto } from "$app/navigation";

    let conversations = $state<ChatConversation[]>([]);
    chatStore.subscribe(value => conversations = value);

    function formatTime(date: Date) {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }).format(date);
    }
</script>

<PageContent>
    <div class="flex items-center justify-between gap-4 mb-6">
        <h1 class="font-orbitron text-2xl font-semibold tracking-wide">
            Chat History
        </h1>
    </div>

    <div class="max-w-3xl space-y-5">
        {#if conversations.length === 0}
            <div class="text-left py-5">
                <p class="text-muted-foreground">No conversations yet</p>
                <p class="text-sm text-muted-foreground mt-1">
                    Start a new chat to begin your conversation history
                </p>
            </div>
        {:else}
            {#each conversations as conversation}
                <button
                    class="w-full px-6 py-4 hover:bg-muted/50 rounded-xl transition-colors text-left group border bg-card"
                    onclick={() => goto(`/chat/conversation/${conversation.id}`)}
                >
                    <div class="flex items-center justify-between">
                        <span class="font-medium text-base">{conversation.title}</span>
                        <span class="text-sm text-muted-foreground">
                            {formatTime(conversation.lastUpdated)}
                        </span>
                    </div>
                    <p class="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {conversation.messages[conversation.messages.length - 1]?.content || 'Empty conversation'}
                    </p>
                </button>
            {/each}
        {/if}
    </div>
</PageContent> 
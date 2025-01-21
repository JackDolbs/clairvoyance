<script lang="ts">
    import * as Sheet from "$lib/components/ui/sheet";
    import { goto } from "$app/navigation";
    import { chatStore, type ChatConversation } from '$lib/stores/chat';
    import { Button } from "$lib/components/ui/button";

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

<Sheet.Content 
    side="right" 
    class="w-[800px] sm:w-[540px] md:w-[800px] lg:w-[900px] xl:w-[1000px]"
>
    <Sheet.Header>
        <Sheet.Title>Chat History</Sheet.Title>
        <Sheet.Description>
            View and continue your previous conversations.
        </Sheet.Description>
        <a 
            href="/chat/conversation"
            class="text-xs text-muted-foreground hover:text-primary no-underline hover:underline hover:underline-offset-4 py-2"
        >
            View All Chats
        </a>
    </Sheet.Header>
    
    <div class="py-6">
        {#if conversations.length === 0}
            <div class="text-sm text-muted-foreground text-left">
                No previous chats yet
            </div>
        {:else}
            <div class="space-y-2">
                {#each conversations as conversation}
                    <button
                        class="w-full px-4 py-3 hover:bg-muted/50 rounded-lg transition-colors text-left group"
                        onclick={() => {
                            goto(`/chat/conversation/${conversation.id}`);
                        }}
                    >
                        <div class="flex items-center justify-between">
                            <span class="font-medium text-sm">{conversation.title}</span>
                            <span class="text-xs text-muted-foreground">
                                {formatTime(conversation.lastUpdated)}
                            </span>
                        </div>
                        <p class="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {conversation.messages[conversation.messages.length - 1]?.content || 'Empty conversation'}
                        </p>
                    </button>
                {/each}
            </div>
        {/if}
    </div>
</Sheet.Content> 
<script lang="ts">
    import type { ChatConversation } from '$lib/stores/chat';
    import { goto } from "$app/navigation";

    export let conversation: ChatConversation;

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
</script>

<div class="relative w-full px-6 py-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
    <button
        class="w-full text-left"
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
</div> 
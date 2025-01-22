<script lang="ts">
    import { History } from "lucide-svelte";
    import * as Sheet from "$lib/components/ui/sheet";
    import { chatStore, type ChatMessage } from '$lib/stores/chat';
    import { goto } from '$app/navigation';
    import ChatHistorySheet from "$lib/components/chat-history-sheet.svelte";
    import ChatInput from "$lib/components/chat-input.svelte";
    import { Button } from "$lib/components/ui/button";
    import ModelSelector from "$lib/components/chat/model-selector.svelte";

    let showHistory = $state(false);
    let selectedContexts = $state<string[]>([]);
    
    async function handleSubmit(message: string) {
        // Create new conversation
        const conversationId = chatStore.addConversation(message, selectedContexts);
        
        // Add initial message
        const userMessage: ChatMessage = {
            role: 'user',
            content: message,
            timestamp: new Date()
        };
        
        chatStore.addMessage(conversationId, userMessage);
        
        // Add assistant response
        const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: 'This is a placeholder response. API integration coming soon!',
            timestamp: new Date()
        };
        
        chatStore.addMessage(conversationId, assistantMessage);
        
        // Navigate to the new conversation
        goto(`/chat/conversation/${conversationId}`);
    }
</script>

<div class="flex flex-col h-full">
    <!-- Chat Header -->
    <header class="flex-none pb-6 flex items-center justify-between px-10">
        <ModelSelector />

        <Button 
            variant="ghost" 
            size="sm"
            class="hover:bg-primary/5 gap-2"
            onclick={() => showHistory = true}
        >
            <History class="w-4 h-4 text-muted-foreground" />
            History
        </Button>
    </header>

    <!-- Chat Content -->
    <main class="flex-1 min-h-0 relative">
        <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
                <p class="text-lg font-medium text-neutral-900">Talk with Clairvoyance</p>
                <p class="text-sm text-muted-foreground mt-1">
                    Ask questions or explore insights about your data
                </p>
            </div>
        </div>
    </main>

    <!-- Chat Footer -->
    <footer class="flex-none py-5 w-full">
        <ChatInput 
            selectedContexts={selectedContexts}
            onContextsChange={(contexts) => selectedContexts = contexts}
            onSubmit={handleSubmit}
        />
    </footer>
</div>

<Sheet.Root open={showHistory} onOpenChange={(value) => showHistory = value}>
    <ChatHistorySheet open={showHistory} onOpenChange={(value) => showHistory = value} />
</Sheet.Root> 
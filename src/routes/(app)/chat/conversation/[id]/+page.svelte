<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { chatStore, type ChatMessage, type ChatConversation } from '$lib/stores/chat';
    import PageContent from "$lib/components/page-content.svelte";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Textarea } from "$lib/components/ui/textarea";
    import { SendHorizontal, History, Search, ArrowLeft } from "lucide-svelte";
    import * as Sheet from "$lib/components/ui/sheet";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { PlusCircle, FileText, Database } from "lucide-svelte";
    import { onMount } from 'svelte';
    import * as Avatar from "$lib/components/ui/avatar";
    import { displayName } from '$lib/stores/profile';
    import ChatHistorySheet from "$lib/components/chat-history-sheet.svelte";
    import ChatInput from "$lib/components/chat-input.svelte";

    // Placeholder data - replace with actual data from ontology
    const availableContexts = [
        { id: '1', name: 'Sales Data 2023', type: 'database' },
        { id: '2', name: 'Customer Feedback', type: 'file' },
        { id: '3', name: 'Product Metrics', type: 'database' },
    ];

    // Fix the props access
    const props = $props<{ data: { conversation: ChatConversation } }>();
    const conversation = props.data.conversation;
    
    let messages = $state(conversation.messages);
    let inputMessage = $state('');
    let selectedContexts = $state(conversation.contexts);
    let chatContainer: HTMLDivElement;
    let textareaElement: HTMLTextAreaElement;
    let showHistory = $state(false);
    let conversations = $state<ChatConversation[]>([]);
    chatStore.subscribe(value => conversations = value);
    let contextSearch = $state('');
    let activeTab = $state('available');

    function formatTime(date: Date) {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }).format(date);
    }

    function handleInput() {
        if (!textareaElement) return;
        
        textareaElement.style.height = 'auto';
        const height = Math.min(textareaElement.scrollHeight, 200);
        textareaElement.style.height = height + 'px';
        textareaElement.style.overflowY = height === 200 ? 'auto' : 'hidden';
    }

    async function handleSubmit(message: string) {
        const chatMessage: ChatMessage = {
            role: 'user',
            content: message,
            timestamp: new Date()
        };

        chatStore.addMessage($page.params.id, chatMessage);
        messages = [...messages, chatMessage];
        
        // Add assistant response
        const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: 'This is a placeholder response. API integration coming soon!',
            timestamp: new Date()
        };
        
        chatStore.addMessage($page.params.id, assistantMessage);
        messages = [...messages, assistantMessage];
        
        // Scroll to bottom
        setTimeout(() => {
            chatContainer?.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }

    onMount(() => {
        if (textareaElement) {
            handleInput();
        }
    });
</script>

<div class="flex flex-col h-full">
    <!-- Chat Header -->
    <header class="flex-none pb-6 flex items-center justify-between px-10">
        <Button 
            variant="ghost" 
            size="sm"
            class="hover:bg-primary/5 gap-2"
            onclick={() => goto('/chat')}
        >
            <ArrowLeft class="w-4 h-4 text-muted-foreground" />
            <span class="sr-only">Back to Chat</span>
        </Button>

        <Button 
            variant="ghost" 
            size="sm"
            class="hover:bg-primary/5 gap-2"
            onclick={() => showHistory = true}
        >
            <History class="w-4 h-4 text-muted-foreground" />
            History
            <span class="sr-only">View Chat History</span>
        </Button>
    </header>

    <!-- Chat Content -->
    <main class="flex-1 min-h-0 relative">
        <div 
            class="absolute inset-0 overflow-y-auto px-10 chat-scroll"
            bind:this={chatContainer}
        >
            <div class="max-w-4xl mx-auto space-y-5 pb-32">
                {#each messages as message}
                    {#if message.role === 'user'}
                        <div class="flex gap-6">
                            <Avatar.Root class="h-12 w-12 shrink-0 rounded-lg">
                                <Avatar.Fallback class="rounded-lg font-orbitron">
                                    {$displayName.slice(0, 2).toUpperCase()}
                                </Avatar.Fallback>
                            </Avatar.Root>
                            <div class="flex-1 space-y-1">
                                <p class="text-lg font-medium leading-relaxed text-neutral-900">
                                    {message.content}
                                </p>
                                <span class="text-xs text-muted-foreground">
                                    {message.timestamp.toLocaleDateString('en-US', { 
                                        month: '2-digit', 
                                        day: '2-digit', 
                                        year: 'numeric'
                                    })} at {formatTime(message.timestamp)}
                                </span>
                            </div>
                        </div>
                    {:else}
                        <div class="pl-18 space-y-3">
                            <div class="bg-muted/30 p-6 rounded-2xl">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-xs font-semibold text-primary/50">Clairvoyance's Response</span>
                                </div>
                                <p class="text-sm leading-relaxed text-neutral-600">
                                    {message.content}
                                </p>
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>
        </div>
    </main>

    <!-- Chat Footer -->
    <footer class="flex-none py-5 w-full">
        <ChatInput 
            selectedContexts={selectedContexts}
            onContextsChange={(contexts) => selectedContexts = contexts}
            onSubmit={(message) => handleSubmit(message)}
        />
    </footer>
</div>

<Sheet.Root bind:open={showHistory}>
    <ChatHistorySheet />
</Sheet.Root> 

<style>
    /* Custom Scrollbar */
    .chat-scroll {
        scrollbar-width: thin;
        scrollbar-color: hsl(var(--muted)) transparent;
    }

    .chat-scroll::-webkit-scrollbar {
        width: 8px;
    }

    .chat-scroll::-webkit-scrollbar-track {
        background: transparent;
    }

    .chat-scroll::-webkit-scrollbar-thumb {
        background-color: hsl(var(--muted) / 0.2);
        border-radius: 20px;
        border: 2px solid transparent;
        background-clip: content-box;
    }

    .chat-scroll::-webkit-scrollbar-thumb:hover {
        background-color: hsl(var(--muted) / 0.3);
    }
</style>
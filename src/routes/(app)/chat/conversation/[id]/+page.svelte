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
    import { firstName, lastName, getFullName } from '$lib/stores/profile';
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
    let conversation = $state(props.data.conversation);
    
    let messages = $state([]);
    let inputMessage = $state('');
    let selectedContexts = $state([]);
    let chatContainer: HTMLDivElement;
    let textareaElement: HTMLTextAreaElement;
    let showHistory = $state(false);
    let conversations = $state<ChatConversation[]>([]);
    chatStore.subscribe(value => conversations = value);
    let contextSearch = $state('');
    let activeTab = $state('available');
    let copiedMessageId = $state<string | null>(null);

    // Replace $: with $derived
    const conversationId = $derived($page.params.id);

    // Replace reactive block with $effect
    $effect(() => {
        const newConversation = chatStore.getConversation(conversationId);
        if (newConversation) {
            conversation = newConversation;
            messages = newConversation.messages;
            selectedContexts = newConversation.contexts;
        }
    });

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

    async function handleCopy(content: string, messageId: string) {
        try {
            await navigator.clipboard.writeText(content);
            copiedMessageId = messageId;
            setTimeout(() => {
                copiedMessageId = null;
            }, 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    onMount(() => {
        messages = conversation.messages;
        selectedContexts = conversation.contexts;
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
                                    {$getFullName(firstName, lastName).slice(0, 2).toUpperCase()}
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
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-xs font-semibold text-primary/50">Clairvoyance's Response</span>
                                    <div class="flex items-center gap-2">
                                        <button 
                                            class="p-1 hover:bg-muted/50 rounded-md transition-colors"
                                            title="Regenerate response"
                                        >
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                width="14" 
                                                height="14" 
                                                viewBox="0 0 24 24" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                stroke-width="2" 
                                                stroke-linecap="round" 
                                                stroke-linejoin="round" 
                                                class="text-muted-foreground"
                                            >
                                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                                                <path d="M21 3v5h-5"/>
                                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                                                <path d="M8 16H3v5"/>
                                            </svg>
                                        </button>
                                        <button 
                                            class="p-1 hover:bg-muted/50 rounded-md transition-colors relative group"
                                            title="Copy to clipboard"
                                            onclick={() => handleCopy(message.content, message.timestamp.toString())}
                                        >
                                            {#if copiedMessageId === message.timestamp.toString()}
                                                <span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Copied!
                                                </span>
                                            {/if}
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                width="14" 
                                                height="14" 
                                                viewBox="0 0 24 24" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                stroke-width="2" 
                                                stroke-linecap="round" 
                                                stroke-linejoin="round" 
                                                class="text-muted-foreground {copiedMessageId === message.timestamp.toString() ? 'text-primary' : ''}"
                                            >
                                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                            </svg>
                                        </button>
                                    </div>
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

<Sheet.Root open={showHistory} onOpenChange={(value) => showHistory = value}>
    <ChatHistorySheet open={showHistory} onOpenChange={(value) => showHistory = value} />
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
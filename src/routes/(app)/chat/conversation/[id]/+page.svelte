<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { chatStore, type ChatMessage, type ChatConversation } from '$lib/stores/chat';
    import PageContent from "$lib/components/page-content.svelte";
    import { Button } from "$lib/components/ui/button";
    import { Textarea } from "$lib/components/ui/textarea";
    import { SendHorizontal, History, Search } from "lucide-svelte";
    import * as Sheet from "$lib/components/ui/sheet";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { PlusCircle, FileText, Database } from "lucide-svelte";
    import { onMount } from 'svelte';

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

    async function handleSubmit() {
        if (!inputMessage.trim()) return;

        const message: ChatMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        chatStore.addMessage($page.params.id, message);
        messages = [...messages, message];
        
        // Add assistant response
        const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: 'This is a placeholder response. API integration coming soon!',
            timestamp: new Date()
        };
        
        chatStore.addMessage($page.params.id, assistantMessage);
        messages = [...messages, assistantMessage];
        
        inputMessage = '';
        
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
    <header class="flex-none pb-6 flex items-center justify-end px-10">
        <Button 
            variant="ghost" 
            size="sm"
            class="hover:bg-primary/5 gap-2"
            onclick={() => goto('/chat')}
        >
            <History class="w-4 h-4 text-muted-foreground" />
            Back to Chat
            <span class="sr-only">Back to Chat</span>
        </Button>
    </header>

    <!-- Chat Content -->
    <main class="flex-1 min-h-0 relative">
        <div 
            class="absolute inset-0 overflow-y-auto pr-4"
            bind:this={chatContainer}
        >
            <div class="space-y-8 pb-32">
                {#each messages as message}
                    <div class="flex gap-4 {message.role === 'assistant' ? 'bg-muted/30 p-6 rounded-2xl' : ''}">
                        <div class="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br {message.role === 'assistant' ? 'from-primary/20 to-primary/30' : 'from-neutral-200 to-neutral-300'} flex items-center justify-center shadow-sm">
                            {#if message.role === 'assistant'}
                                <span class="text-sm font-semibold text-primary/70">AI</span>
                            {:else}
                                <span class="text-sm font-semibold text-neutral-600">You</span>
                            {/if}
                        </div>
                        <div class="flex-1 space-y-2">
                            <div class="flex items-center gap-2">
                                <span class="font-medium text-neutral-900">
                                    {message.role === 'assistant' ? 'Assistant' : 'You'}
                                </span>
                                <span class="text-xs text-muted-foreground font-medium">
                                    {formatTime(message.timestamp)}
                                </span>
                            </div>
                            <p class="text-sm leading-relaxed text-neutral-700">
                                {message.content}
                            </p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </main>

    <!-- Chat Footer -->
    <footer class="flex-none py-5 w-full">
        <div class="max-w-3xl mx-auto px-4">
            <div class="rounded-2xl border shadow-lg bg-background/80 backdrop-blur-sm">
                <!-- Add Contexts -->
                {#if selectedContexts.length > 0}
                    <div class="px-4 pt-3 flex gap-2 flex-wrap">
                        {#each selectedContexts as contextId}
                            {@const context = availableContexts.find(c => c.id === contextId)}
                            {#if context}
                                <div class="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                                    {#if context.type === 'database'}
                                        <Database class="w-3 h-3" />
                                    {:else}
                                        <FileText class="w-3 h-3" />
                                    {/if}
                                    {context.name}
                                </div>
                            {/if}
                        {/each}
                    </div>
                {/if}

                <form 
                    class="flex gap-5 p-4" 
                    onsubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div class="flex-1">
                        <textarea
                            placeholder="Ask Clairvoyance a question..."
                            bind:value={inputMessage}
                            bind:this={textareaElement}
                            class="w-full resize-none border rounded-md px-3 py-3 bg-transparent focus:outline-none text-neutral-700 text-sm"
                            style="height: 44px; overflow-y: hidden;"
                            rows="1"
                            oninput={(e) => {
                                const textarea = e.target as HTMLTextAreaElement;
                                textarea.style.height = '44px';
                                const height = Math.min(textarea.scrollHeight, 200);
                                textarea.style.height = height + 'px';
                                textarea.style.overflowY = height === 200 ? 'auto' : 'hidden';
                            }}
                            onkeydown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    const textarea = e.target as HTMLTextAreaElement;
                                    const start = textarea.selectionStart;
                                    const end = textarea.selectionEnd;
                                    inputMessage = inputMessage.substring(0, start) + '\n' + inputMessage.substring(end);
                                    e.preventDefault();
                                    setTimeout(() => {
                                        textarea.selectionStart = textarea.selectionEnd = start + 1;
                                    }, 0);
                                }
                                else if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                        />
                    </div>

                    <Button 
                        type="submit" 
                        disabled={!inputMessage.trim()} 
                        class="shrink-0 my-auto hover:bg-primary/5 transition-colors"
                        variant="ghost"
                        size="icon"
                    >
                        <SendHorizontal class="w-5 h-5 {inputMessage.trim() ? 'text-primary' : 'text-muted-foreground'}" />
                    </Button>
                </form>
            </div>
        </div>
    </footer>
</div> 
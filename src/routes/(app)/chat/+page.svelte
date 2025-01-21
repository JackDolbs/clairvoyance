<script lang="ts">
    import PageContent from "$lib/components/page-content.svelte";
    import { Button } from "$lib/components/ui/button";
    import { Textarea } from "$lib/components/ui/textarea";
    import { SendHorizontal, History } from "lucide-svelte";
    import * as Sheet from "$lib/components/ui/sheet";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { PlusCircle, FileText, Database } from "lucide-svelte";
    import { onMount } from 'svelte';

    interface ChatMessage {
        role: 'user' | 'assistant';
        content: string;
        timestamp: Date;
    }

    let messages = $state<ChatMessage[]>([]);
    let inputMessage = $state('');
    let chatContainer: HTMLDivElement;
    let showHistory = $state(false);
    let selectedContexts = $state<string[]>([]);
    let textareaElement: HTMLTextAreaElement;

    // Placeholder data - replace with actual data from ontology
    const availableContexts = [
        { id: '1', name: 'Sales Data 2023', type: 'database' },
        { id: '2', name: 'Customer Feedback', type: 'file' },
        { id: '3', name: 'Product Metrics', type: 'database' },
    ];

    function formatTime(date: Date) {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }).format(date);
    }

    function handleInput() {
        if (!textareaElement) return;
        
        // First set height to 0 to get the correct scrollHeight
        textareaElement.style.height = '0px';
        
        // Get the scrollHeight and set it as the new height
        const newHeight = Math.min(textareaElement.scrollHeight, 200);
        textareaElement.style.height = `${newHeight}px`;
    }

    onMount(() => {
        if (textareaElement) {
            handleInput();
        }
    });

    async function handleSubmit() {
        if (!inputMessage.trim()) return;

        messages = [...messages, {
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        }];

        const userMessage = inputMessage;
        inputMessage = '';

        messages = [...messages, {
            role: 'assistant',
            content: 'This is a placeholder response. API integration coming soon!',
            timestamp: new Date()
        }];

        setTimeout(() => {
            chatContainer?.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }
</script>

<div class="flex flex-col h-full">
    <!-- Chat Header -->
    <header class="flex-none pb-6 flex items-center justify-center px-10">
        <Button 
            variant="ghost" 
            size="sm"
            class="hover:bg-primary/5 gap-2"
            onclick={() => showHistory = true}
        >
            <History class="w-4 h-4 text-muted-foreground" />
            History
            <span class="sr-only">Chat History</span>
        </Button>
    </header>

    <!-- Chat Content -->
    <main class="flex-1 min-h-0 relative">
        <div 
            class="absolute inset-0 overflow-y-auto pr-4"
            bind:this={chatContainer}
        >
            {#if messages.length > 0}
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
            {:else}
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-center">
                        <p class="text-lg font-medium text-neutral-900">Start a Conversation</p>
                        <p class="text-sm text-muted-foreground mt-1">
                            Ask questions or explore insights about your data
                        </p>
                    </div>
                </div>
            {/if}
        </div>
    </main>

    <!-- Chat Footer -->
    <footer class="flex-none py-5 px-40">
        <div class="rounded-2xl border shadow-lg bg-background/80 backdrop-blur-sm">
            <!-- Selected Contexts -->
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
                                <button 
                                    class="hover:bg-primary/20 rounded-full p-0.5" 
                                    onclick={() => selectedContexts = selectedContexts.filter(id => id !== context.id)}
                                >
                                    <span class="sr-only">Remove {context.name}</span>
                                    <svg class="w-3 h-3" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"/></svg>
                                </button>
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
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            class="shrink-0 my-auto hover:bg-primary/5"
                        >
                            <PlusCircle class="w-5 h-5 text-muted-foreground" />
                            <span class="sr-only">Add Context</span>
                        </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content class="w-56">
                        <DropdownMenu.Label>Add Context</DropdownMenu.Label>
                        {#each availableContexts as context}
                            <DropdownMenu.CheckboxItem
                                checked={selectedContexts.includes(context.id)}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        selectedContexts = [...selectedContexts, context.id];
                                    } else {
                                        selectedContexts = selectedContexts.filter(id => id !== context.id);
                                    }
                                }}
                            >
                                <div class="flex items-center gap-2">
                                    {#if context.type === 'database'}
                                        <Database class="w-4 h-4" />
                                    {:else}
                                        <FileText class="w-4 h-4" />
                                    {/if}
                                    {context.name}
                                </div>
                            </DropdownMenu.CheckboxItem>
                        {/each}
                    </DropdownMenu.Content>
                </DropdownMenu.Root>

                <div class="flex-1 flex flex-col min-h-[44px]">
                    <Textarea
                        placeholder="Message Clairvoyance..."
                        bind:value={inputMessage}
                        bind:this={textareaElement}
                        class="flex-1 w-full resize-none bg-transparent focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-neutral-700"
                        rows="1"
                        on:input={handleInput}
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
    </footer>
</div>

<!-- Chat History Sheet -->
<Sheet.Root bind:open={showHistory}>
    <Sheet.Content side="right" class="w-[600px] sm:w-[540px] md:w-[600px] lg:w-[700px]">
        <Sheet.Header>
            <Sheet.Title>Chat History</Sheet.Title>
            <Sheet.Description>
                View and continue your previous conversations
            </Sheet.Description>
        </Sheet.Header>
        
        <div class="py-6">
            <!-- Placeholder for chat history items -->
            <div class="text-sm text-muted-foreground text-center">
                No previous chats yet
            </div>
        </div>
    </Sheet.Content>
</Sheet.Root> 
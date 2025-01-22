<script lang="ts">
    import PageContent from "$lib/components/page-content.svelte";
    import { Button } from "$lib/components/ui/button";
    import { Textarea } from "$lib/components/ui/textarea";
    import { SendHorizontal, History, Search } from "lucide-svelte";
    import * as Sheet from "$lib/components/ui/sheet";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { PlusCircle, FileText, Database } from "lucide-svelte";
    import { onMount } from 'svelte';
    import { chatStore, type ChatMessage, type ChatConversation } from '$lib/stores/chat';
    import { goto } from '$app/navigation';
    import ChatHistorySheet from "$lib/components/chat-history-sheet.svelte";

    let conversations = $state<ChatConversation[]>([]);
    chatStore.subscribe(value => conversations = value);

    let inputMessage = $state('');
    let chatContainer: HTMLDivElement;
    let showHistory = $state(false);
    let selectedContexts = $state<string[]>([]);
    let textareaElement: HTMLTextAreaElement;
    let contextSearch = $state('');
    let activeTab = $state('added');

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
        
        // First clear the height
        textareaElement.style.height = 'auto';
        
        // Then set it to the scroll height
        const height = Math.min(textareaElement.scrollHeight, 200);
        textareaElement.style.height = height + 'px';
        
        // Enable/disable scrolling based on content height
        textareaElement.style.overflowY = height === 200 ? 'auto' : 'hidden';
    }

    onMount(() => {
        if (textareaElement) {
            handleInput();
        }
    });

    async function handleSubmit() {
        if (!inputMessage.trim()) return;

        // Create new conversation
        const conversationId = chatStore.addConversation(inputMessage, selectedContexts);
        
        // Add initial message
        const message: ChatMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };
        
        chatStore.addMessage(conversationId, message);
        
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
    <header class="flex-none pb-6 flex items-center justify-end px-10">
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
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                    <p class="text-lg font-medium text-neutral-900">Talk with Clairvoyance</p>
                    <p class="text-sm text-muted-foreground mt-1">
                        Ask questions or explore insights about your data
                    </p>
                </div>
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
                        <DropdownMenu.Content class="w-64">
                            <!-- Search Bar -->
                            <div class="p-1.5 border-b">
                                <div class="flex items-center px-2 py-1 rounded-md border bg-muted/50">
                                    <Search class="w-3 h-3 text-muted-foreground mr-1.5" />
                                    <input 
                                        type="text" 
                                        placeholder="Search contexts..." 
                                        class="flex-1 bg-transparent focus:outline-none text-xs"
                                        bind:value={contextSearch}
                                    />
                                </div>
                            </div>

                            <!-- Tabs -->
                            <div class="border-b">
                                <div class="flex">
                                    <button 
                                        class="flex-1 px-2 py-1.5 text-xs font-medium border-b-2 transition-colors {activeTab === 'added' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}"
                                        onclick={() => activeTab = 'added'}
                                    >
                                        Added
                                    </button>
                                    <button 
                                        class="flex-1 px-2 py-1.5 text-xs font-medium border-b-2 transition-colors {activeTab === 'available' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}"
                                        onclick={() => activeTab = 'available'}
                                    >
                                        Available
                                    </button>
                                </div>
                            </div>

                            <!-- Content -->
                            <div class="py-1 max-h-[250px] overflow-y-auto">
                                {#if activeTab === 'added'}
                                    {#if selectedContexts.length === 0}
                                        <div class="px-2 py-3 text-xs text-center text-muted-foreground">
                                            No contexts added yet
                                        </div>
                                    {:else}
                                        {#each selectedContexts as contextId}
                                            {@const context = availableContexts.find(c => c.id === contextId)}
                                            {#if context && (!contextSearch || context.name.toLowerCase().includes(contextSearch.toLowerCase()))}
                                                <DropdownMenu.CheckboxItem
                                                    checked={true}
                                                    onCheckedChange={() => {
                                                        selectedContexts = selectedContexts.filter(id => id !== context.id);
                                                    }}
                                                    class="text-xs py-1.5"
                                                >
                                                    <div class="flex items-center">
                                                        {#if context.type === 'database'}
                                                            <Database class="w-3 h-3" />
                                                        {:else}
                                                            <FileText class="w-3 h-3" />
                                                        {/if}
                                                        {context.name}
                                                    </div>
                                                </DropdownMenu.CheckboxItem>
                                            {/if}
                                        {/each}
                                    {/if}
                                {:else}
                                    {#each availableContexts.filter(c => !selectedContexts.includes(c.id)) as context}
                                        {#if !contextSearch || context.name.toLowerCase().includes(contextSearch.toLowerCase())}
                                            <DropdownMenu.CheckboxItem
                                                checked={false}
                                                onCheckedChange={() => {
                                                    selectedContexts = [...selectedContexts, context.id];
                                                }}
                                                class="text-xs py-1.5"
                                            >
                                                <div class="flex items-center gap-1.5">
                                                    {#if context.type === 'database'}
                                                        <Database class="w-3 h-3" />
                                                    {:else}
                                                        <FileText class="w-3 h-3" />
                                                    {/if}
                                                    {context.name}
                                                </div>
                                            </DropdownMenu.CheckboxItem>
                                        {/if}
                                    {/each}
                                {/if}
                            </div>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>

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
                                // Command/Ctrl + Enter for new line
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    const textarea = e.target as HTMLTextAreaElement;
                                    const start = textarea.selectionStart;
                                    const end = textarea.selectionEnd;
                                    
                                    // Insert new line at cursor position
                                    inputMessage = inputMessage.substring(0, start) + '\n' + inputMessage.substring(end);
                                    
                                    // Prevent default and update cursor position
                                    e.preventDefault();
                                    setTimeout(() => {
                                        textarea.selectionStart = textarea.selectionEnd = start + 1;
                                    }, 0);
                                }
                                // Just Enter for submit
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

<Sheet.Root bind:open={showHistory}>
    <ChatHistorySheet />
</Sheet.Root> 
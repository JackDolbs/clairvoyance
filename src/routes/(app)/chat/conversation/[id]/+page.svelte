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
            <div class="max-w-3xl mx-auto space-y-6 pb-32">
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
                                    <span class="text-sm font-semibold text-primary/70">Clairvoyance</span>
                                    <span class="text-xs text-muted-foreground">
                                        {formatTime(message.timestamp)}
                                    </span>
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

<Sheet.Root bind:open={showHistory}>
    <ChatHistorySheet />
</Sheet.Root> 
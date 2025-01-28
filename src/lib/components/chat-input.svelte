<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { SendHorizontal, Search, PlusCircle, FileText, Database } from "lucide-svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { onMount } from 'svelte';

    type Props = {
        selectedContexts: string[];
        onContextsChange: (contexts: string[]) => void;
        onSubmit: (message: string) => void;
    }

    const { selectedContexts, onContextsChange, onSubmit } = $props<Props>();

    let inputMessage = $state('');
    let textareaElement: HTMLTextAreaElement;
    let contextSearch = $state('');
    let activeTab = $state('available');

    // Placeholder data - replace with actual data from ontology
    const availableContexts = [
        { id: '1', name: 'Sales Data 2023', type: 'database' },
        { id: '2', name: 'Customer Feedback', type: 'file' },
        { id: '3', name: 'Product Metrics', type: 'database' },
    ];

    function handleInput() {
        if (!textareaElement) return;
        textareaElement.style.height = 'auto';
        const height = Math.min(textareaElement.scrollHeight, 200);
        textareaElement.style.height = height + 'px';
        textareaElement.style.overflowY = height === 200 ? 'auto' : 'hidden';
    }

    function handleSubmit() {
        if (!inputMessage.trim()) return;
        onSubmit(inputMessage);
        inputMessage = '';
    }

    onMount(() => {
        if (textareaElement) {
            handleInput();
        }
    });
</script>

<div class="max-w-4xl mx-auto px-4">
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
                                onclick={() => onContextsChange(selectedContexts.filter(id => id !== context.id))}
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
                                                onContextsChange(selectedContexts.filter(id => id !== context.id));
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
                        {:else}
                            {#each availableContexts.filter(c => !selectedContexts.includes(c.id)) as context}
                                {#if !contextSearch || context.name.toLowerCase().includes(contextSearch.toLowerCase())}
                                    <DropdownMenu.CheckboxItem
                                        checked={false}
                                        onCheckedChange={() => {
                                            onContextsChange([...selectedContexts, context.id]);
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
                    class="w-full resize-none border rounded-md px-3 py-3 focus:outline-none text-neutral-700 text-sm bg-muted/30"
                    style="height: 44px; overflow-y: hidden;"
                    rows="1"
                    oninput={handleInput}
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
                ></textarea>
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
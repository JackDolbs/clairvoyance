<script lang="ts">
    import * as Popover from "$lib/components/ui/popover";
    import * as Accordion from "$lib/components/ui/accordion";
    import { Button } from "$lib/components/ui/button";
    import { Calendar, Database, FileText, SlidersHorizontal } from "lucide-svelte";
    import { RangeCalendar } from "$lib/components/ui/range-calendar";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { cn } from "$lib/utils";
    import { createEventDispatcher } from 'svelte';

    export let dateFilter: 'all' | 'today' | 'week' | 'month' | 'custom';
    export let dateRange: { from: Date | undefined; to: Date | undefined };
    export let typeFilters: Set<string>;

    const dispatch = createEventDispatcher();

    function formatDate(date: Date) {
        return new Intl.DateTimeFormat('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: 'numeric'
        }).format(date);
    }

    function handleClearFilters() {
        dispatch('clearFilters');
    }
</script>

<Popover.Root>
    <Popover.Trigger>
        <Button variant="outline" size="sm" class="gap-2">
            <SlidersHorizontal class="w-4 h-4" />
            Filter
            {#if dateFilter !== 'all' || typeFilters.size > 0}
                <span class="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs">
                    {(dateFilter !== 'all' ? 1 : 0) + (typeFilters.size > 0 ? 1 : 0)}
                </span>
            {/if}
        </Button>
    </Popover.Trigger>
    <Popover.Content class="w-80 p-4" align="end">
        <div class="space-y-4">
            <Accordion.Root type="single" defaultValue="date">
                <!-- Date Range Accordion -->
                <Accordion.Item value="date" class="border-none">
                    <Accordion.Trigger class="pb-2 text-sm font-normal">
                        <div class="flex items-center gap-2">
                            <Calendar class="w-4 h-4" />
                            <span>Date Range</span>
                            {#if dateFilter !== 'all'}
                                <span class="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-xs">
                                    Active
                                </span>
                            {/if}
                        </div>
                    </Accordion.Trigger>
                    <Accordion.Content>
                        <div class="grid gap-2 pt-2">
                            <!-- Quick filters -->
                            <div class="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    class={cn(dateFilter === 'today' && "bg-primary/10 text-primary")}
                                    onclick={() => dateFilter = 'today'}
                                >
                                    Today
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    class={cn(dateFilter === 'week' && "bg-primary/10 text-primary")}
                                    onclick={() => dateFilter = 'week'}
                                >
                                    Past Week
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    class={cn(dateFilter === 'month' && "bg-primary/10 text-primary")}
                                    onclick={() => dateFilter = 'month'}
                                >
                                    Past Month
                                </Button>
                            </div>

                            <!-- Date range picker -->
                            <div class="pt-2">
                                <Button 
                                    variant="outline" 
                                    class={cn(
                                        "w-full justify-start text-left font-normal",
                                        dateFilter === 'custom' && "bg-primary/10 text-primary"
                                    )}
                                    onclick={() => {
                                        if (!dateRange.from || !dateRange.to) {
                                            dateFilter = 'custom';
                                        }
                                    }}
                                >
                                    <Calendar class="mr-2 h-4 w-4" />
                                    {#if dateRange.from && dateRange.to}
                                        {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                                    {:else}
                                        Select date range
                                    {/if}
                                </Button>
                                {#if dateFilter === 'custom'}
                                    <div class="absolute left-0 mt-2 p-0 bg-popover border rounded-md shadow-md">
                                        <RangeCalendar
                                            bind:value={dateRange}
                                            initialFocus
                                            onValueChange={(value) => {
                                                if (value?.from && value?.to) {
                                                    dateFilter = 'custom';
                                                }
                                            }}
                                        ></RangeCalendar>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </Accordion.Content>
                </Accordion.Item>

                <!-- Context Type Accordion -->
                <Accordion.Item value="context" class="border-none">
                    <Accordion.Trigger class="pb-2 text-sm font-normal">
                        <div class="flex items-center gap-2">
                            <Database class="w-4 h-4" />
                            <span>Context Type</span>
                            {#if typeFilters.size > 0}
                                <span class="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-xs">
                                    {typeFilters.size}
                                </span>
                            {/if}
                        </div>
                    </Accordion.Trigger>
                    <Accordion.Content>
                        <div class="grid gap-2 pt-2">
                            {#each [
                                { value: 'database', label: 'Database', icon: Database },
                                { value: 'file', label: 'Files', icon: FileText }
                            ] as option}
                                <label
                                    class="flex items-center gap-2 px-2 py-1 text-sm rounded-md hover:bg-muted/50"
                                >
                                    <Checkbox
                                        checked={typeFilters.has(option.value)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                typeFilters.add(option.value);
                                            } else {
                                                typeFilters.delete(option.value);
                                            }
                                            typeFilters = typeFilters;
                                        }}
                                    />
                                    <svelte:component this={option.icon} class="w-3 h-3" />
                                    <span>{option.label}</span>
                                </label>
                            {/each}
                        </div>
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion.Root>

            {#if dateFilter !== 'all' || typeFilters.size > 0}
                <div class="h-px bg-border"></div>
                <button
                    class="w-full text-xs text-primary hover:text-primary/80 transition-colors text-left"
                    on:click={handleClearFilters}
                >
                    Clear All Filters
                </button>
            {/if}
        </div>
    </Popover.Content>
</Popover.Root> 
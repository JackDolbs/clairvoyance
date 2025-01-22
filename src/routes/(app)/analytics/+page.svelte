<script lang="ts">
    import PageContent from "$lib/components/page-content.svelte";
    import * as Table from "$lib/components/ui/table";
    import { Button } from "$lib/components/ui/button";
    import { Plus, FileText, Calendar, User2, ArrowUpRight } from "lucide-svelte";

    // Mock data for notebooks
    const notebooks = [
        {
            id: '1',
            name: 'User Cohort Analysis',
            author: 'John Doe',
            created: new Date('2024-03-15'),
            lastModified: new Date('2024-03-20'),
            status: 'published'
        },
        {
            id: '2',
            name: 'Revenue Attribution',
            author: 'Jane Smith',
            created: new Date('2024-03-10'),
            lastModified: new Date('2024-03-18'),
            status: 'draft'
        },
        {
            id: '3',
            name: 'Product Usage Metrics',
            author: 'John Doe',
            created: new Date('2024-03-05'),
            lastModified: new Date('2024-03-16'),
            status: 'published'
        }
    ];

    function formatDate(date: Date) {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    }
</script>

<PageContent>
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="font-orbitron text-2xl font-semibold tracking-wide">
                Analytics Notebooks
            </h1>
            <p class="text-sm text-muted-foreground mt-1">
                Create and manage  notebooks for data analysis
            </p>
        </div>
        <Button onclick={() => {/* TODO: Add new notebook logic */}}>
            <Plus class="w-4 h-4 mr-2" />
            New Notebook
        </Button>
    </div>

    <div class="rounded-md border">
        <Table.Root>
            <Table.Header>
                <Table.Row>
                    <Table.Head>Name</Table.Head>
                    <Table.Head>Author</Table.Head>
                    <Table.Head>Created</Table.Head>
                    <Table.Head>Last Modified</Table.Head>
                    <Table.Head>Status</Table.Head>
                    <Table.Head class="text-right">Actions</Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each notebooks as notebook}
                    <Table.Row>
                        <Table.Cell>
                            <div class="flex items-center gap-2">
                                <FileText class="w-4 h-4 text-muted-foreground" />
                                <span>{notebook.name}</span>
                            </div>
                        </Table.Cell>
                        <Table.Cell>
                            <div class="flex items-center gap-2">
                                <User2 class="w-4 h-4 text-muted-foreground" />
                                <span>{notebook.author}</span>
                            </div>
                        </Table.Cell>
                        <Table.Cell>
                            <div class="flex items-center gap-2">
                                <Calendar class="w-4 h-4 text-muted-foreground" />
                                <span>{formatDate(notebook.created)}</span>
                            </div>
                        </Table.Cell>
                        <Table.Cell>{formatDate(notebook.lastModified)}</Table.Cell>
                        <Table.Cell>
                            <div class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                notebook.status === 'published' 
                                    ? 'bg-green-500/10 text-green-500' 
                                    : 'bg-yellow-500/10 text-yellow-500'
                            }`}>
                                {notebook.status}
                            </div>
                        </Table.Cell>
                        <Table.Cell class="text-right">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                class="h-8 w-8 p-0"
                            >
                                <ArrowUpRight class="w-4 h-4" />
                                <span class="sr-only">Open notebook</span>
                            </Button>
                        </Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
</PageContent> 
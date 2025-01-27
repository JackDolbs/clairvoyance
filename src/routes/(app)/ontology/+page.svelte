<script lang="ts">
    import PageContent from "$lib/components/page-content.svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Tabs from "$lib/components/ui/tabs";
    import * as Table from "$lib/components/ui/table";
    import Plus from "lucide-svelte/icons/plus";
    import Edit from "lucide-svelte/icons/edit";
    import Trash from "lucide-svelte/icons/trash";
    import Link from "lucide-svelte/icons/link";
    import * as Dialog from "$lib/components/ui/dialog";
    import FileUp from "lucide-svelte/icons/file-up";
    import FileDown from "lucide-svelte/icons/file-down";
    import { Separator } from "$lib/components/ui/separator";
    import Code from "lucide-svelte/icons/code";
    import { Input } from "$lib/components/ui/input";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Badge } from "$lib/components/ui/badge";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import Filter from "lucide-svelte/icons/filter";
    import ArrowRight from "lucide-svelte/icons/arrow-right";
    import Check from "lucide-svelte/icons/check";

    // Define ontology structure
    const ontologyClasses = [
        {
            id: 'organization',
            name: 'Organization',
            description: 'A company or business entity using the SaaS platform',
            properties: [
                { name: 'industry', type: 'string', required: true },
                { name: 'employees', type: 'number', required: true },
                { name: 'annualRevenue', type: 'string', required: false },
                { name: 'region', type: 'string', required: true },
                { name: 'customerSince', type: 'date', required: true },
                { name: 'status', type: 'enum', required: true }
            ],
            relationships: [
                { target: 'department', type: 'hasMany', name: 'departments' },
                { target: 'subscription', type: 'hasMany', name: 'subscriptions' },
                { target: 'user', type: 'hasMany', name: 'users' }
            ]
        },
        {
            id: 'department',
            name: 'Department',
            description: 'Organizational unit within a company',
            properties: [
                { name: 'name', type: 'string', required: true },
                { name: 'headcount', type: 'number', required: true },
                { name: 'budget', type: 'number', required: false },
                { name: 'location', type: 'string', required: false }
            ],
            relationships: [
                { target: 'organization', type: 'belongsTo', name: 'organization' },
                { target: 'user', type: 'hasMany', name: 'members' }
            ]
        },
        {
            id: 'user',
            name: 'User',
            description: 'End user of the platform',
            properties: [
                { name: 'email', type: 'string', required: true },
                { name: 'role', type: 'enum', required: true },
                { name: 'lastLogin', type: 'datetime', required: false },
                { name: 'preferences', type: 'json', required: false }
            ],
            relationships: [
                { target: 'organization', type: 'belongsTo', name: 'organization' },
                { target: 'department', type: 'belongsTo', name: 'department' },
                { target: 'session', type: 'hasMany', name: 'sessions' }
            ]
        },
        {
            id: 'product_module',
            name: 'Product Module',
            description: 'Core functional module of the platform',
            properties: [
                { name: 'name', type: 'string', required: true },
                { name: 'version', type: 'string', required: true },
                { name: 'status', type: 'enum', required: true },
                { name: 'releaseDate', type: 'date', required: true }
            ],
            relationships: [
                { target: 'feature', type: 'hasMany', name: 'features' },
                { target: 'subscription', type: 'belongsToMany', name: 'subscriptions' }
            ]
        },
        {
            id: 'subscription',
            name: 'Subscription',
            description: 'Product subscription and billing plan',
            properties: [
                { name: 'plan', type: 'enum', required: true },
                { name: 'startDate', type: 'date', required: true },
                { name: 'endDate', type: 'date', required: false },
                { name: 'seats', type: 'number', required: true },
                { name: 'billingCycle', type: 'enum', required: true }
            ],
            relationships: [
                { target: 'organization', type: 'belongsTo', name: 'organization' },
                { target: 'product_module', type: 'hasMany', name: 'modules' },
                { target: 'invoice', type: 'hasMany', name: 'invoices' }
            ]
        }
    ];

    const relationshipTypes = [
        { 
            id: 'belongs_to',
            name: 'Belongs To',
            description: 'One-to-many ownership relationship',
            sourceTypes: ['department', 'user', 'subscription'],
            targetTypes: ['organization', 'department']
        },
        { 
            id: 'has_many',
            name: 'Has Many',
            description: 'One-to-many collection relationship',
            sourceTypes: ['organization', 'department', 'product_module'],
            targetTypes: ['user', 'department', 'feature', 'subscription']
        },
        { 
            id: 'belongs_to_many',
            name: 'Belongs To Many',
            description: 'Many-to-many relationship',
            sourceTypes: ['product_module', 'feature'],
            targetTypes: ['subscription', 'user']
        },
        { 
            id: 'uses',
            name: 'Uses',
            description: 'Usage tracking relationship',
            sourceTypes: ['user'],
            targetTypes: ['product_module', 'feature']
        },
        { 
            id: 'manages',
            name: 'Manages',
            description: 'Administrative relationship',
            sourceTypes: ['user'],
            targetTypes: ['department', 'product_module']
        }
    ];

    // Add state for dialog
    let csvDialogOpen = false;
    let jsonContent = JSON.stringify({
        classes: ontologyClasses,
        relationships: relationshipTypes
    }, null, 2);

    // Add state for table features
    let searchQuery = '';
    let selectedClasses = ontologyClasses.map(c => ({ ...c, selected: true }));

    // Add filtering logic
    $: filteredClasses = selectedClasses
        .filter(c => c.selected)
        .filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

    // Add export and import functions
    function exportSchema() {
        // Implementation of exportSchema
    }

    function importSchema() {
        // Implementation of importSchema
    }

    function formatJSON() {
        // Implementation of formatJSON
    }

    function validateSchema() {
        // Implementation of validateSchema
    }

    function saveSchema() {
        // Implementation of saveSchema
    }
</script>

<PageContent>
    <div class="space-y-6">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="font-orbitron text-2xl font-semibold tracking-wide">
                    Ontology
                </h1>
                <p class="text-sm text-muted-foreground mt-1">
                    Design your data model by defining classes, relationships, and validation rules. 
                </p>
            </div>
            <div class="flex items-center gap-2">
                <Button variant="outline" onclick={() => csvDialogOpen = true}>
                    <Code class="h-4 w-4 mr-2" />
                    Edit Full Schema
                </Button>
                <Button>
                    <Plus class="h-4 w-4 mr-2" />
                    Add Class
                </Button>
            </div>
        </div>

        <!-- Add CSV Dialog -->
        <Dialog.Root bind:open={csvDialogOpen}>
            <Dialog.Content class="max-w-3xl">
                <Dialog.Header>
                    <Dialog.Title>Edit Full Schema</Dialog.Title>
                    <Dialog.Description>
                        Edit the complete ontology structure in JSON format. This includes all classes, relationships, and validation rules.
                        Changes here will update your entire data model.
                    </Dialog.Description>
                </Dialog.Header>

                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <Button variant="outline" size="sm" onclick={exportSchema}>
                                <FileDown class="h-4 w-4 mr-2" />
                                Export Schema
                            </Button>
                            <Button variant="outline" size="sm" onclick={importSchema}>
                                <FileUp class="h-4 w-4 mr-2" />
                                Import Schema
                            </Button>
                        </div>
                        <div class="flex items-center gap-2">
                            <Button variant="outline" size="sm" onclick={formatJSON}>
                                <Code class="h-4 w-4 mr-2" />
                                Format JSON
                            </Button>
                            <Button variant="outline" size="sm" onclick={validateSchema}>
                                <Check class="h-4 w-4 mr-2" />
                                Validate
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    <div class="relative">
                        <textarea 
                            class="w-full h-[400px] font-mono text-sm p-4 rounded-md bg-secondary/20"
                            bind:value={jsonContent}
                            placeholder="Enter your ontology schema in JSON format..."
                        ></textarea>
                        <div class="absolute top-2 right-2 text-xs text-muted-foreground">
                            JSON Schema Editor
                        </div>
                    </div>
                </div>

                <Dialog.Footer>
                    <Button variant="outline" onclick={() => csvDialogOpen = false}>
                        Cancel
                    </Button>
                    <Button onclick={saveSchema}>
                        Save Changes
                    </Button>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>

        <!-- Main Content -->
        <Tabs.Root value="classes" defaultValue="classes" class="w-full">
            <Tabs.List class="border-b">
                <Tabs.Trigger value="classes" class="px-4 py-2 -mb-px">
                    Classes
                    <span class="ml-2 text-xs text-muted-foreground">({ontologyClasses.length})</span>
                </Tabs.Trigger>
                <Tabs.Trigger value="relationships" class="px-4 py-2 -mb-px">
                    Relationships
                    <span class="ml-2 text-xs text-muted-foreground">({relationshipTypes.length})</span>
                </Tabs.Trigger>
                <Tabs.Trigger value="validation" class="px-4 py-2 -mb-px">Validation Rules</Tabs.Trigger>
            </Tabs.List>

            <!-- Classes Tab -->
            <Tabs.Content value="classes" class="pt-4">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-medium mb-1">Data Classes</h2>
                    <div class="flex items-center gap-2">
                        <Input 
                            type="text" 
                            placeholder="Search classes..." 
                            bind:value={searchQuery}
                            class="w-64"
                        />
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                                <div>
                                    <Button variant="outline" size="sm">
                                        <Filter class="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                </div>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                                <DropdownMenu.Label>Show Classes</DropdownMenu.Label>
                                {#each selectedClasses as cls}
                                    <DropdownMenu.CheckboxItem
                                        checked={cls.selected}
                                        onCheckedChange={(checked) => cls.selected = checked}
                                    >
                                        {cls.name}
                                    </DropdownMenu.CheckboxItem>
                                {/each}
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    </div>
                </div>
                <div class="grid grid-cols-4 gap-4 mb-6">
                    <div class="p-4 bg-secondary/20 rounded-lg">
                        <div class="text-sm text-muted-foreground">Total Classes</div>
                        <div class="text-2xl font-semibold">{ontologyClasses.length}</div>
                    </div>
                    <div class="p-4 bg-secondary/20 rounded-lg">
                        <div class="text-sm text-muted-foreground">Total Properties</div>
                        <div class="text-2xl font-semibold">
                            {ontologyClasses.reduce((acc, c) => acc + c.properties.length, 0)}
                        </div>
                    </div>
                    <div class="p-4 bg-secondary/20 rounded-lg">
                        <div class="text-sm text-muted-foreground">Total Relationships</div>
                        <div class="text-2xl font-semibold">
                            {ontologyClasses.reduce((acc, c) => acc + c.relationships.length, 0)}
                        </div>
                    </div>
                    <div class="p-4 bg-secondary/20 rounded-lg">
                        <div class="text-sm text-muted-foreground">Required Properties</div>
                        <div class="text-2xl font-semibold">
                            {ontologyClasses.reduce((acc, c) => 
                                acc + c.properties.filter(p => p.required).length, 0
                            )}
                        </div>
                    </div>
                </div>
                <div class="mt-4">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>Name</Table.Head>
                                <Table.Head>Description</Table.Head>
                                <Table.Head>Properties</Table.Head>
                                <Table.Head>Relationships</Table.Head>
                                <Table.Head class="w-[100px]">Actions</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each filteredClasses as ontologyClass}
                                <Table.Row>
                                    <Table.Cell class="font-medium">{ontologyClass.name}</Table.Cell>
                                    <Table.Cell>{ontologyClass.description}</Table.Cell>
                                    <Table.Cell>
                                        <div class="flex flex-wrap gap-1">
                                            {#each ontologyClass.properties as prop}
                                                <Badge 
                                                    variant={prop.required ? 'default' : 'secondary'}
                                                    class="flex items-center gap-1"
                                                >
                                                    {prop.name}
                                                    <span class="text-xs opacity-80">({prop.type})</span>
                                                </Badge>
                                            {/each}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div class="flex flex-wrap gap-1">
                                            {#each ontologyClass.relationships as rel}
                                                <Badge 
                                                    variant="outline" 
                                                    class="flex items-center gap-1"
                                                >
                                                    <span class="font-medium">{rel.name}</span>
                                                    <ArrowRight class="h-3 w-3" />
                                                    <span>{rel.target}</span>
                                                    <span class="text-xs opacity-80">({rel.type})</span>
                                                </Badge>
                                            {/each}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div class="flex items-center gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Edit class="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Trash class="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </div>
            </Tabs.Content>

            <!-- Relationships Tab -->
            <Tabs.Content value="relationships" class="pt-4">
                <div class="mb-4">
                    <h2 class="text-lg font-medium mb-1">Relationship Types</h2>
                    <p class="text-sm text-muted-foreground">
                        Define how different classes can be connected. These relationships form the structure of your knowledge graph.
                    </p>
                </div>
                <div class="mt-4">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>Name</Table.Head>
                                <Table.Head>Description</Table.Head>
                                <Table.Head>Source Types</Table.Head>
                                <Table.Head>Target Types</Table.Head>
                                <Table.Head class="w-[100px]">Actions</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each relationshipTypes as rel}
                                <Table.Row>
                                    <Table.Cell class="font-medium">{rel.name}</Table.Cell>
                                    <Table.Cell>{rel.description}</Table.Cell>
                                    <Table.Cell>
                                        <div class="flex flex-wrap gap-1">
                                            {#each rel.sourceTypes as type}
                                                <span class="text-xs bg-secondary px-2 py-1 rounded">
                                                    {type}
                                                </span>
                                            {/each}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div class="flex flex-wrap gap-1">
                                            {#each rel.targetTypes as type}
                                                <span class="text-xs bg-secondary px-2 py-1 rounded">
                                                    {type}
                                                </span>
                                            {/each}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div class="flex items-center gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Edit class="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Trash class="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </div>
            </Tabs.Content>

            <!-- Validation Rules Tab -->
            <Tabs.Content value="validation" class="pt-4">
                <div class="mb-4">
                    <h2 class="text-lg font-medium mb-1">Validation Rules</h2>
                    <p class="text-sm text-muted-foreground">
                        Set constraints and validation rules to ensure data integrity across your ontology.
                    </p>
                </div>
                <div class="mt-4">
                    <!-- Add validation rules management here -->
                </div>
            </Tabs.Content>
        </Tabs.Root>
    </div>
</PageContent> 
<script lang="ts">
    import * as Select from "$lib/components/ui/select";
    
    const models = [
        { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' }
    ] as const;
    
    let value = $state(models[0].value);
    
    const triggerContent = $derived(
        models.find((m) => m.value === value)?.label ?? "Select a model"
    );
</script>

<Select.Root type="single" bind:value>
    <Select.Trigger class="w-[180px]">
        {triggerContent}
    </Select.Trigger>
    <Select.Content>
        <Select.Group>
            <Select.GroupHeading class="flex items-center gap-2">
                Models
            </Select.GroupHeading>
            {#each models as model}
                <Select.Item value={model.value} label={model.label}>
                    {model.label}
                </Select.Item>
            {/each}
            <Select.Item value="coming-soon" disabled class="text-muted-foreground">
                More models coming soon
            </Select.Item>
        </Select.Group>
    </Select.Content>
</Select.Root> 
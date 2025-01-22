<script lang="ts">
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Button } from "$lib/components/ui/button";
    import { SlidersHorizontal } from "lucide-svelte";

    export let sortBy: 'newest' | 'oldest';
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
        <Button variant="outline" size="sm" class="gap-2">
            <SlidersHorizontal class="w-4 h-4" />
            Sort
        </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
        <DropdownMenu.RadioGroup value={sortBy} onValueChange={(value) => sortBy = value}>
            <DropdownMenu.RadioItem value="newest">
                Newest First
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="oldest">
                Oldest First
            </DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
    </DropdownMenu.Content>
</DropdownMenu.Root> 
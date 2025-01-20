<script lang="ts">
    import SidebarPage from "$lib/components/sidebar-page.svelte";
    import { OnboardingModal } from "$lib/components/ui/onboarding";
    import { browser } from "$app/environment";

    let showOnboarding = false;

    $: if (browser && !localStorage.getItem('onboardingComplete')) {
        showOnboarding = true;
    }
</script>

<div class="bg-neutral-50 min-h-screen">
    <SidebarPage>
        <slot />
    </SidebarPage>
</div>

<OnboardingModal bind:open={showOnboarding} /> 
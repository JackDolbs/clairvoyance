<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Pagination } from "$lib/components/ui/pagination";
    import Progress from "$lib/components/ui/progress/progress.svelte";
    import { initializePocketBase } from '$lib/services/pocketbase';

    export let open = false;
    let currentStep = 0;
    let initializationComplete = false;

    function handleSkip() {
        open = false;
        if (typeof window !== 'undefined') {
            localStorage.setItem('onboardingComplete', 'true');
        }
    }

    function handleRestart() {
        currentStep = 0;
        initializationComplete = false;
    }

    async function handleNext() {
        if (currentStep === 1 && !initializationComplete) {
            const success = await initializePocketBase();
            if (success) {
                initializationComplete = true;
                currentStep++;
            }
            return;
        }

        if (currentStep < 2) {
            currentStep++;
        } else {
            open = false;
            if (typeof window !== 'undefined') {
                localStorage.setItem('onboardingComplete', 'true');
            }
        }
    }

    function handlePageChange(page: number) {
        if (page === 1 && !initializationComplete) {
            return;
        }
        currentStep = page;
    }
</script>

<Dialog.Root bind:open modal>
    <Dialog.Content class="sm:max-w-[90vw] sm:h-[85vh] p-10 sm:px-20 flex flex-col items-center justify-center">
        <!-- Step-specific Content -->
        <div class="w-full flex-1 flex items-center justify-center">
            {#if currentStep === 0}
                <div class="h-full flex flex-col items-center justify-center space-y-10">
                    <h2 class="text-4xl font-orbitron tracking-wider text-center">
                        Welcome to Clairvoyance
                    </h2>
                    <p class="font-grotesk text-lg text-center text-muted-foreground max-w-xl mx-auto">
                        Let's get you started with the basics.
                    </p>
                    <Button 
                        onclick={handleNext}
                        size="lg"
                        class="px-20 text-sm"
                    >
                        Get Started
                    </Button>
                </div>
            {:else if currentStep === 1}
                <div class="space-y-6 text-center">
                    <h2 class="text-2xl font-orbitron tracking-wider">Database Setup</h2>
                    <p class="text-muted-foreground">Initializing your database...</p>
                    {#await initializePocketBase()}
                        <div class="w-[300px] mx-auto">
                            <Progress value={undefined} />
                        </div>
                    {:then success}
                        {#if success}
                            <div class="text-green-500 font-medium">
                                Database initialized successfully!
                                <Button 
                                    onclick={handleNext}
                                    class="ml-4"
                                >
                                    Continue
                                </Button>
                            </div>
                        {:else}
                            <div class="text-red-500 font-medium">
                                Failed to initialize database.
                                <Button 
                                    onclick={() => currentStep = 1}
                                    variant="outline"
                                    class="ml-4"
                                >
                                    Try Again
                                </Button>
                            </div>
                        {/if}
                    {/await}
                </div>
            {:else if currentStep === 2}
                <div class="space-y-5 w-full">
                    <h2 class="text-2xl font-orbitron tracking-wider text-center mb-8">Connect Your Data</h2>
                    <p class="text-sm text-center text-muted-foreground mb-10">
                        Choose a data source to begin analyzing your information.
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        <Button variant="outline" class="h-24 flex flex-col items-center justify-center gap-2">
                            <span class="font-medium">Upload Files</span>
                            <span class="text-xs text-muted-foreground">Upload your own data via CSV</span>
                        </Button>
                        <Button variant="outline" class="h-24 flex flex-col items-center justify-center gap-2">
                            <span class="font-medium">Data Source</span>
                            <span class="text-xs text-muted-foreground">Connect to an integrated data source</span>
                        </Button>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Footer Navigation -->
        <Dialog.Footer class="w-full flex flex-col items-center gap-4">
            <div class="flex items-center justify-center w-full gap-6 text-sm text-muted-foreground">
                <button class="hover:text-foreground" on:click={handleSkip}>
                    Skip onboarding
                </button>
                <span>·</span>
                <button class="hover:text-foreground" on:click={handleRestart}>
                    Restart onboarding
                </button>
            </div>
        </Dialog.Footer>
        <div class="flex justify-center w-full mt-3">
            <Pagination 
                currentPage={currentStep} 
                totalPages={3} 
                onPageChange={handlePageChange}
            />
        </div>
    </Dialog.Content>
</Dialog.Root> 
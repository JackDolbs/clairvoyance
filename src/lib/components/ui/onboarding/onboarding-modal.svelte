<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Pagination } from "$lib/components/ui/pagination";

    export let open = false;
    let currentStep = 0;

    function handleSkip() {
        open = false;
        if (typeof window !== 'undefined') {
            localStorage.setItem('onboardingComplete', 'true');
        }
    }

    function handleRestart() {
        currentStep = 0;
    }

    function handleNext() {
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
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl h-full place-content-center">
                    <div class="space-y-6 flex flex-col justify-center">
                        <h2 class="text-2xl font-orbitron tracking-wider">What is Clairvoyance?</h2>
                        <p class="text-sm">
                            Clairvoyance is a custom analytics engine for startups developed by Auriel Analytics. It transforms raw data into actionable insights through custom ontologies, semantic knowledge graphs, and tailored dashboards, helping startups make data-driven decisions to boost their metrics.
                        </p>
                        <div class="mt-6">
                            <Button 
                                onclick={handleNext}
                                size="lg"
                                class="px-20 text-sm"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                    <div class="space-y-8 flex flex-col justify-center">
                        <div class="space-y-6">
                            <div>
                                <h4 class="font-medium mb-1">Data Analysis:</h4>
                                <p class="text-muted-foreground text-sm">
                                    Advanced analytics and visualization tools to help you make sense of your data.
                                </p>
                            </div>
                            <div>
                                <h4 class="font-medium mb-1">No vendor lock-in:</h4>
                                <p class="text-muted-foreground text-sm">
                                    All your data and configurations are stored locally, giving you complete control and ownership.
                                </p>
                            </div>
                            <div>
                                <h4 class="font-medium mb-1">Monitoring:</h4>
                                <p class="text-muted-foreground text-sm">
                                    Get notified about important insights and changes in your data through your preferred channels.
                                </p>
                            </div>
                        </div>
                    </div>
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
<script lang="ts">
    import { goto } from '$app/navigation';
    import { fade, fly } from 'svelte/transition';
    import * as InputOTP from "$lib/components/ui/input-otp/index.js";
    import Logo from "$lib/components/Logo.svelte";
    import * as Card from "$lib/components/ui/card/index.js";
    import { toast } from "$lib/components/ui/sonner";
    
    let value = '';

    const isUsingDefaultPin = !import.meta.env.VITE_AUTH_PIN;

    $: if (value.length === 4) {
        handlePinSubmit();
    }

    async function handlePinSubmit() {
        if (value.length === 4) {
            const correctPin = import.meta.env.VITE_AUTH_PIN || '0000';
            if (value === correctPin) {
                const expiryTime = new Date().getTime() + (8 * 60 * 60 * 1000);
                localStorage.setItem('authExpiry', expiryTime.toString());
                toast.info("Preparing your workspace...");
                await new Promise(resolve => setTimeout(resolve, 1000));
                toast.success("Welcome back!");
                setTimeout(() => {
                    goto('/');
                }, 1500);
            } else {
                toast.error("Incorrect PIN, please try again");
                value = '';
            }
        }
    }
</script>

<div class="flex h-screen w-full flex-col items-center justify-center px-4 gap-10" in:fade={{ duration: 300 }}>
    <Logo size="text-3xl" />
    
    <Card.Root class="mx-auto px-10 py-5 max-w-lg">
        <Card.Header>
            <Card.Title class="text-2xl mb-2 text-center font-orbitron">Access PIN Required</Card.Title>
            <Card.Description class="text-center text-sm max-w-xs">
                Enter the 4-digit PIN configured in your <span class="font-medium">VITE_AUTH_PIN</span> environment variable
            </Card.Description>
        </Card.Header>
        <Card.Content>
            <div class="grid">
                <div class="flex justify-center items-center mb-5">
                    <InputOTP.Root 
                        maxlength={4} 
                        bind:value
                    >
                        {#snippet children({ cells })}
                            <InputOTP.Group>
                                {#each cells as cell}
                                    <InputOTP.Slot {cell} />
                                {/each}
                            </InputOTP.Group>
                        {/snippet}
                    </InputOTP.Root>
                </div>

                {#if isUsingDefaultPin}
                    <p class="text-xs text-amber-500 text-center" in:fade>
                        You are using the default PIN (0000).
                    </p>
                    <p class="text-xs text-amber-500 text-center" in:fade>
                        Configure VITE_AUTH_PIN in your environment for security.
                    </p>
                {/if}
            </div>
        </Card.Content>
    </Card.Root>
</div>

<style>
    .shake {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }

    @keyframes shake {
        10%, 90% {
            transform: translate3d(-1px, 0, 0);
        }
        20%, 80% {
            transform: translate3d(2px, 0, 0);
        }
        30%, 50%, 70% {
            transform: translate3d(-2px, 0, 0);
        }
        40%, 60% {
            transform: translate3d(2px, 0, 0);
        }
    }
</style> 
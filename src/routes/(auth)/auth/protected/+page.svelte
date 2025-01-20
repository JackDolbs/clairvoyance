<script lang="ts">
    import { goto } from '$app/navigation';
    import { fade, fly } from 'svelte/transition';
    import * as InputOTP from "$lib/components/ui/input-otp/index.js";
    import Logo from "$lib/components/Logo.svelte";
    import * as Card from "$lib/components/ui/card/index.js";
    
    let value = '';
    let showSuccess = false;
    let showError = false;

    const isUsingDefaultPin = !import.meta.env.VITE_AUTH_PIN;

    $: {
        if (value.length === 4) {
            const correctPin = import.meta.env.VITE_AUTH_PIN || '0000';
            if (value === correctPin) {
                const expiryTime = new Date().getTime() + (8 * 60 * 60 * 1000); // 8 hours
                localStorage.setItem('authExpiry', expiryTime.toString());
                showSuccess = true;
                setTimeout(() => {
                    goto('/');
                }, 1500);
            } else {
                showError = true;
                value = '';
                setTimeout(() => {
                    showError = false;
                }, 2000);
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
            {#if !showSuccess}
                <div class="grid">
                    <div class="flex justify-center items-center mb-5" class:shake={showError}>
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

                    {#if showError}
                        <p class="text-sm text-red-500 text-center font-orbitron mb-5" in:fade>Invalid PIN code</p>
                    {/if}

                    {#if isUsingDefaultPin}
                        <p class="text-xs text-amber-500 text-center" in:fade>
                            You are using the default PIN (0000).
                        </p>
                        <p class="text-xs text-amber-500 text-center" in:fade>
                            Configure VITE_AUTH_PIN in your environment for security.
                        </p>
                    {/if}
                </div>
            {:else}
                <div class="text-center"
                     in:fly={{ y: 20, duration: 500 }}
                     out:fade={{ duration: 300 }}>
                    <p class="text-sm text-center font-orbitron font-semibold text-emerald-500">
                        Access Granted
                    </p>
                </div>
            {/if}
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
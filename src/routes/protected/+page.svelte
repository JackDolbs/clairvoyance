<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { fade, fly } from 'svelte/transition';
    import * as InputOTP from "$lib/components/ui/input-otp/index.js";
    
    let value = '';
    let isAuthenticated = false;
    let showSuccess = false;

    onMount(() => {
        if (browser) {
            const authExpiry = localStorage.getItem('authExpiry');
            if (authExpiry && new Date().getTime() < parseInt(authExpiry)) {
                isAuthenticated = true;
                goto('/');
            }
        }
    });

    $: {
        console.log('Current value:', value);
        if (value.length === 4) {
            if (value === '0000') {
                const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
                localStorage.setItem('authExpiry', expiryTime.toString());
                isAuthenticated = true;
                showSuccess = true;
                // Delay the redirect
                setTimeout(() => {
                    goto('/');
                }, 2000); // Wait 2 seconds before redirecting
            } else {
                alert('Invalid PIN');
                value = '';
            }
        }
    }
</script>

<div class="flex flex-col items-center justify-center h-screen space-y-5" in:fade={{ duration: 300 }}>
    {#if !showSuccess}
        <h1 class="font-orbitron text-4xl font-bold tracking-wider" 
            in:fade={{ duration: 300, delay: 150 }}>
            Clairvoyance
        </h1>
        <p class="font-orbitron font-light text-neutral-600" 
           in:fade={{ duration: 300, delay: 300 }}>
            Enter pre-alpha access code
        </p>
        <div in:fade={{ duration: 300, delay: 450 }}>
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
    {:else}
        <div class="text-center"
             in:fly={{ y: 20, duration: 500 }}
             out:fade={{ duration: 300 }}>
            <h2 class="font-orbitron text-4xl font-bold text-emerald-500 mb-3">
                Access Granted
            </h2>
            <p class="font-orbitron text-neutral-600">
                Welcome to Clairvoyance
            </p>
        </div>
    {/if}
</div> 
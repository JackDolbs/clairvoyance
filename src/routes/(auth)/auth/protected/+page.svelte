<script lang="ts">
    import { goto } from '$app/navigation';
    import { fade, fly } from 'svelte/transition';
    import * as InputOTP from "$lib/components/ui/input-otp/index.js";
    
    let value = '';
    let showSuccess = false;

    $: {
        if (value.length === 4) {
            if (value === '0000') {
                const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
                localStorage.setItem('authExpiry', expiryTime.toString());
                showSuccess = true;
                setTimeout(() => {
                    goto('/');
                }, 1500);
            } else {
                alert('Invalid PIN');
                value = '';
            }
        }
    }
</script>

<div class="flex flex-col items-center justify-center min-h-screen space-y-5 bg-neutral-50" in:fade={{ duration: 300 }}>
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
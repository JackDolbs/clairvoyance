<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';
    import * as InputOTP from "$lib/components/ui/input-otp/index.js";
    
    let value = '';
    let isAuthenticated = false;

    onMount(() => {
        if (browser) {
            const authExpiry = localStorage.getItem('authExpiry');
            if (authExpiry && new Date().getTime() < parseInt(authExpiry)) {
                isAuthenticated = true;
                goto('/');
            }
        }
    });

    $: if (value.length === 4) {
        if (value === '0000') {
            const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
            localStorage.setItem('authExpiry', expiryTime.toString());
            isAuthenticated = true;
            goto('/');
        } else {
            alert('Invalid PIN');
            value = '';
        }
    }
</script>

<div class="flex flex-col items-center justify-center h-screen space-y-5" in:fade={{ duration: 300 }}>
    <h1 class="font-orbitron text-4xl font-bold tracking-wider" in:fade={{ duration: 300, delay: 150 }}>Clairvoyance</h1>
    <p class="font-orbitron font-light text-neutral-600" in:fade={{ duration: 300, delay: 300 }}>Enter pre-alpha access code</p>
    <div in:fade={{ duration: 300, delay: 450 }}>
        <InputOTP.Root maxlength={4}>
            {#snippet children({ cells })}
                <InputOTP.Group>
                    {#each cells as cell}
                        <InputOTP.Slot {cell} />
                    {/each}
                </InputOTP.Group>
            {/snippet}
        </InputOTP.Root>
    </div>
</div> 
<script lang="ts">
    import { browser } from '$app/environment';
    import PageContent from "$lib/components/page-content.svelte";
    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { Check, AlertCircle, Upload, XCircle } from "lucide-svelte";
    import { fade } from "svelte/transition";
    import * as Tooltip from "$lib/components/ui/tooltip";

    type StatusMessage = {
        type: 'success' | 'error';
        text: string;
    } | null;

    // User preferences stored in localStorage
    let displayName = '';
    let orgName = '';
    let imageUrl = '';
    let statusMessage: StatusMessage = null;

    // Only access localStorage in the browser
    if (browser) {
        displayName = localStorage.getItem('user_displayName') || '';
        orgName = localStorage.getItem('user_orgName') || '';
        imageUrl = localStorage.getItem('user_avatar') || '';
    }

    async function handleImageUpload(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (typeof e.target?.result === 'string') {
                        imageUrl = e.target.result;
                        if (browser) {
                            try {
                                localStorage.setItem('user_avatar', e.target.result);
                                showStatus('success', 'Profile picture updated');
                            } catch (err) {
                                console.error('Failed to save image:', err);
                                showStatus('error', 'Failed to save image');
                            }
                        }
                    }
                };
                reader.onerror = () => {
                    console.error('Failed to read file');
                    showStatus('error', 'Failed to load image');
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Upload error:', error);
                showStatus('error', 'Failed to upload image');
            }
        }
    }

    function showStatus(type: 'success' | 'error', text: string) {
        statusMessage = { type, text };
        setTimeout(() => statusMessage = null, 3000);
    }

    function handleSave(event: MouseEvent) {
        event.preventDefault();
        
        if (!browser) return;
        
        try {
            localStorage.setItem('user_displayName', displayName);
            localStorage.setItem('user_orgName', orgName);
            if (imageUrl) {
                localStorage.setItem('user_avatar', imageUrl);
            }
            showStatus('success', 'Settings saved');
        } catch (err) {
            console.error('Save error:', err);
            showStatus('error', 'Failed to save settings');
        }
    }

    function checkStoredImage() {
        if (browser) {
            const stored = localStorage.getItem('user_avatar');
            console.log('Stored image exists:', !!stored);
            console.log('Current imageUrl:', !!imageUrl);
        }
    }
</script>

<PageContent>
    <div class="flex items-center justify-between gap-4 mb-6">
        <h1 class="font-orbitron text-2xl font-semibold tracking-wide">
            Profile Settings
        </h1>
        {#if statusMessage}
            <div class="flex items-center gap-2 text-sm" 
                class:text-emerald-600={statusMessage.type === 'success'}
                class:text-red-600={statusMessage.type === 'error'}
                in:fade
            >
                {#if statusMessage.type === 'success'}
                    <Check class="w-4 h-4" />
                {:else}
                    <XCircle class="w-4 h-4" />
                {/if}
                <span>{statusMessage.text}</span>
            </div>
        {/if}
    </div>

    <div class="space-y-8 max-w-2xl">
        <Card.Root>
            <Card.Header>
                <Card.Title>Appearance</Card.Title>
                <Card.Description>
                    Customize how the application looks for you
                </Card.Description>
            </Card.Header>
            <Card.Content class="space-y-5">
                <div class="space-y-4">
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <Label>Profile Picture</Label>
                            <Tooltip.Root>
                                <Tooltip.Trigger>
                                    <AlertCircle class="w-4 h-4 text-amber-500" />
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                    <p>Profile picture is stored in your browser's local storage.<br/>
                                    It won't sync across devices or browsers.</p>
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="h-20 w-20 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden border">
                                {#if imageUrl}
                                    <img 
                                        src={imageUrl} 
                                        alt="Profile" 
                                        class="h-full w-full object-cover"
                                    />
                                {:else}
                                    <Upload class="h-8 w-8 text-neutral-400" />
                                {/if}
                            </div>
                            <div class="flex-1 space-y-2">
                                <Input 
                                    type="file" 
                                    accept="image/*"
                                    on:change={handleImageUpload}
                                    class="cursor-pointer h-10 file:h-full file:mr-4 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium hover:file:bg-accent file:cursor-pointer file:text-foreground file:bg-muted flex items-center"
                                />
                                <p class="text-xs text-muted-foreground">
                                    Upload a profile picture (stored locally in your browser)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <Label for="displayName">Display Name</Label>
                        <Input 
                            id="displayName"
                            bind:value={displayName}
                            placeholder="Enter your display name"
                        />
                        <p class="text-xs text-neutral-500">Your personal display name within the application</p>
                    </div>

                    <div class="space-y-2">
                        <Label for="orgName">Organization Name</Label>
                        <Input 
                            id="orgName"
                            bind:value={orgName}
                            placeholder="Enter your organization name"
                        />
                        <p class="text-xs text-neutral-500">The name of your organization or instance</p>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <div class="flex items-center gap-2">
                        <Label>Theme Preference</Label>
                        <Tooltip.Root>
                            <Tooltip.Trigger>
                                <AlertCircle class="w-4 h-4 text-amber-500" />
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                                <p>Theme customization coming soon</p>
                            </Tooltip.Content>
                        </Tooltip.Root>
                    </div>
                    <div class="grid grid-cols-3 gap-4">
                        <div 
                            class="opacity-50 cursor-not-allowed w-full h-10 px-4 py-2 inline-flex items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors"
                        >
                            Light
                        </div>

                        <div 
                            class="opacity-50 cursor-not-allowed w-full h-10 px-4 py-2 inline-flex items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors"
                        >
                            Dark
                        </div>

                        <div 
                            class="opacity-50 cursor-not-allowed w-full h-10 px-4 py-2 inline-flex items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors"
                        >
                            System
                        </div>
                    </div>
                </div>
            </Card.Content>
            <Card.Footer>
                <button 
                    type="button"
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    on:click={(e) => {
                        checkStoredImage();
                        handleSave(e);
                    }}
                >
                    Save Changes
                </button>
            </Card.Footer>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <div class="flex items-center gap-2">
                    <Card.Title>Security</Card.Title>
                    <Tooltip.Root>
                        <Tooltip.Trigger>
                            <AlertCircle class="w-4 h-4 text-amber-500" />
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                            <p>Account security features coming soon</p>
                        </Tooltip.Content>
                    </Tooltip.Root>
                </div>
                <Card.Description>
                    Manage your account security settings
                </Card.Description>
            </Card.Header>
            <Card.Content class="space-y-6">
                <div class="space-y-2">
                    <Label for="email">Email Address</Label>
                    <Input 
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        disabled
                        class="opacity-50 cursor-not-allowed"
                    />
                    <p class="text-xs text-neutral-500">Used for account recovery and notifications</p>
                </div>

                <div class="space-y-2">
                    <Label>Password</Label>
                    <div class="grid gap-2">
                    <Input 
                        id="password"
                        type="password"
                        placeholder="*******"
                        disabled
                        class="opacity-50 cursor-not-allowed"
                    />
                        <p class="text-xs text-neutral-500">Set a password for email-based authentication</p>
                    </div>
                </div>

                <div class="space-y-2">
                    <Label>Two-Factor Authentication</Label>
                    <div class="grid gap-2">
                     <Input 
                        id="2FA"
                        type="2FA"
                        placeholder="Configure 2FA"
                        disabled
                        class="opacity-50 cursor-not-allowed"
                    />
                        <p class="text-xs text-neutral-500">Add an extra layer of security using an authenticator app</p>
                    </div>
                </div>

                <div class="space-y-2">
                    <Label>Recovery Options</Label>
                    <div class="grid gap-2">
                    <Input 
                        id="recovery"
                        type="recovery"
                        placeholder="Configure Recovery Methods"
                        disabled
                        class="opacity-50 cursor-not-allowed"
                    />
                        <p class="text-xs text-neutral-500">Set up backup methods to regain access to your account</p>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title>Instance Information</Card.Title>
                <Card.Description>
                    Details about your application instance
                </Card.Description>
            </Card.Header>
            <Card.Content>
                <div class="space-y-1 text-sm">
                    <p class="flex justify-between">
                        <span class="text-neutral-500">Version</span>
                        <span class="font-medium">Pre-alpha</span>
                    </p>
                    <p class="flex justify-between">
                        <span class="text-neutral-500">Auth method</span>
                        <span class="font-medium">PIN Protected</span>
                    </p>
                    <p class="flex justify-between">
                        <span class="text-neutral-500">Environment</span>
                        <span class="font-medium">{import.meta.env.MODE}</span>
                    </p>
                </div>
            </Card.Content>
        </Card.Root>
    </div>
</PageContent> 
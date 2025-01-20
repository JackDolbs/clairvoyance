<script lang="ts">
    import { browser } from '$app/environment';
    import PageContent from "$lib/components/page-content.svelte";
    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card";
    import { Check, AlertCircle, Upload, XCircle } from "lucide-svelte";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import { displayName, orgName } from '$lib/stores/profile';
    import { toast } from "$lib/components/ui/sonner";

    let saving = false;

    // Only access localStorage in the browser
    if (browser) {
        $displayName = localStorage.getItem('user_displayName') || 'Demo User';
        $orgName = localStorage.getItem('user_orgName') || 'Demo Company';
    }

    async function handleSave() {
        if (!browser) return;
        saving = true;
        
        try {
            localStorage.setItem('user_displayName', $displayName);
            localStorage.setItem('user_orgName', $orgName);
            await new Promise(resolve => setTimeout(resolve, 500));
            toast.success("Profile updated successfully");
        } catch (err) {
            console.error('Save error:', err);
            toast.error("Failed to update profile");
        } finally {
            saving = false;
        }
    }
</script>

<PageContent>
    <div class="flex items-center justify-between gap-4 mb-6">
        <h1 class="font-orbitron text-2xl font-semibold tracking-wide">
            Profile Settings
        </h1>
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
                                    <p>Profile picture customization coming soon</p>
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="h-20 w-20 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden border">
                                <Upload class="h-8 w-8 text-neutral-400" />
                            </div>
                            <div class="flex-1 space-y-2">
                                <Input 
                                    type="file" 
                                    accept="image/*"
                                    disabled
                                    class="opacity-50 cursor-not-allowed h-10 file:h-full file:mr-4 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-medium file:text-foreground file:bg-muted flex items-center"
                                />
                                <p class="text-xs text-muted-foreground">
                                    Upload a profile picture (feature coming soon)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <Label for="displayName">Display Name</Label>
                        <Input 
                            id="displayName"
                            bind:value={$displayName}
                            placeholder="Enter your display name"
                        />
                        <p class="text-xs text-neutral-500">Your personal display name within the application</p>
                    </div>

                    <div class="space-y-2">
                        <Label for="orgName">Organization Name</Label>
                        <Input 
                            id="orgName"
                            bind:value={$orgName}
                            placeholder="Enter your organization name"
                        />
                        <p class="text-xs text-neutral-500">The name of your organization or instance</p>
                    </div>
                </div>
            </Card.Content>
            <Card.Footer class="flex flex-col items-start gap-4">
                <Button 
                    disabled={saving}
                    onclick={handleSave}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
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
    </div>
</PageContent> 
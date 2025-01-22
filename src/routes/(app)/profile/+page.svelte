<script lang="ts">
    import { browser } from '$app/environment';
    import PageContent from "$lib/components/page-content.svelte";
    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import * as Tabs from "$lib/components/ui/tabs";
    import { Check, AlertCircle, Upload, XCircle } from "lucide-svelte";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import { displayName, orgName } from '$lib/stores/profile';
    import { toast } from "$lib/components/ui/sonner";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    let saving = false;
    let currentTab = "appearance";

    function handleTabChange(tab: string) {
        currentTab = tab;
        const url = new URL($page.url);
        url.searchParams.set('tab', tab);
        goto(url, { replaceState: true });
    }

    $: {
        const tab = $page.url.searchParams.get('tab');
        if (tab && ["appearance", "security"].includes(tab)) {
            currentTab = tab;
        }
    }

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
    <div class="flex items-center gap-4 mb-6">
        <h1 class="font-orbitron text-2xl font-semibold tracking-wide">
            Profile Settings
        </h1>
    </div>

    <div class="max-w-2xl">
        <Tabs.Root 
            value={currentTab} 
            onValueChange={handleTabChange} 
            class="space-y-6"
        >
            <Tabs.List>
                <Tabs.Trigger value="appearance">Appearance</Tabs.Trigger>
                <Tabs.Trigger value="security">Security</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="appearance" class="space-y-6">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Account Appearance</Card.Title>
                        <Card.Description>
                            Customize how the application looks for you
                        </Card.Description>
                    </Card.Header>
                    <Card.Content class="space-y-5">
                        <!-- Profile Picture Section -->
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

                        <!-- Display Name Section -->
                        <div class="space-y-2">
                            <Label for="displayName">Display Name</Label>
                            <Input 
                                id="displayName"
                                bind:value={$displayName}
                                placeholder="Enter your display name"
                            />
                            <p class="text-xs text-neutral-500">Your personal display name within the application</p>
                        </div>

                        <!-- Organization Name Section -->
                        <div class="space-y-2">
                            <Label for="orgName">Organization Name</Label>
                            <Input 
                                id="orgName"
                                bind:value={$orgName}
                                placeholder="Enter your organization name"
                            />
                            <p class="text-xs text-neutral-500">The name of your organization or instance</p>
                        </div>
                    </Card.Content>
                    <Card.Footer>
                        <Button 
                            disabled={saving}
                            onclick={handleSave}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Card.Footer>
                </Card.Root>
            </Tabs.Content>

            <Tabs.Content value="security" class="space-y-6">
                <Card.Root>
                    <Card.Header>
                        <div class="flex items-center gap-2">
                            <Card.Title>Account Security</Card.Title>
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
                        <!-- Email Section -->
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

                        <!-- Password Section -->
                        <div class="space-y-2">
                            <Label>Password</Label>
                            <Input 
                                type="password"
                                placeholder="*******"
                                disabled
                                class="opacity-50 cursor-not-allowed"
                            />
                            <p class="text-xs text-neutral-500">Set a password for email-based authentication</p>
                        </div>

                        <!-- 2FA Section -->
                        <div class="space-y-2">
                            <Label>Two-Factor Authentication</Label>
                            <Input 
                                placeholder="Configure 2FA"
                                disabled
                                class="opacity-50 cursor-not-allowed"
                            />
                            <p class="text-xs text-neutral-500">Add an extra layer of security using an authenticator app</p>
                        </div>

                        <!-- Recovery Section -->
                        <div class="space-y-2">
                            <Label>Recovery Options</Label>
                            <Input 
                                placeholder="Configure Recovery Methods"
                                disabled
                                class="opacity-50 cursor-not-allowed"
                            />
                            <p class="text-xs text-neutral-500">Set up backup methods to regain access to your account</p>
                        </div>
                    </Card.Content>
                </Card.Root>
            </Tabs.Content>
        </Tabs.Root>
    </div>
</PageContent> 
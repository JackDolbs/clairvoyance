<script lang="ts">
    import PageContent from "$lib/components/page-content.svelte";
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import { AlertCircle, Eye, EyeOff, Clock } from "lucide-svelte";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import * as Select from "$lib/components/ui/select";
    import * as Switch from "$lib/components/ui/switch";
    import * as Tabs from "$lib/components/ui/tabs";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import pb, { testPocketBaseConnection } from "$lib/services/pocketbase";
    import { onMount } from 'svelte';
    import { toast } from "$lib/components/ui/sonner";
    import { writable } from 'svelte/store';

    let showPin = $state(false);
    const pin = import.meta.env.VITE_AUTH_PIN || '0000';

    // Create a reactive store for PB status
    const pbStatus = writable({
        isRunning: false,
        version: "Unknown"
    });

    function handleTabChange(tab: string) {
        const url = new URL($page.url);
        url.searchParams.set('tab', tab);
        goto(url, { replaceState: true });
    }

    let tabValue = $state("instance");

    async function updatePbStatus() {
        try {
            const health = await pb.health.check();
            console.log("Health check response:", JSON.stringify(health, null, 2));
            
            pbStatus.set({
                isRunning: health?.code === 200,
                version: health?.code === 200 ? "Running" : "Stopped"
            });
        } catch (err) {
            console.error("Health check failed:", err);
            pbStatus.set({
                isRunning: false,
                version: "Stopped"
            });
        }
    }

    // Update status on mount and every 30 seconds
    onMount(() => {
        updatePbStatus();
        const interval = setInterval(updatePbStatus, 30000);
        return () => clearInterval(interval);
    });

    function togglePin() {
        showPin = !showPin;
    }

    async function handleTestConnection() {
        try {
            const isConnected = await testPocketBaseConnection();
            if (isConnected) {
                toast.success("PocketBase connection successful!");
                await updatePbStatus(); // Update status after successful test
            } else {
                toast.error("Failed to connect to PocketBase");
            }
        } catch (err) {
            console.error("Test connection error:", err);
            toast.error("Failed to connect to PocketBase");
        }
    }

    // Just show connection status
    async function isConnected() {
        const health = await pb.health.check();
        return health?.code === 200;
    }
</script>

<PageContent>
    <div class="flex items-center gap-4 mb-6">
        <h1 class="font-orbitron text-2xl font-semibold tracking-wide">
            Config
        </h1>
    </div>

    <div class="max-w-3xl">
        <Tabs.Root 
            value={tabValue}
            onValueChange={(value) => {
                tabValue = value;
                handleTabChange(value);
            }}
            class="space-y-6"
        >
            <Tabs.List>
                <Tabs.Trigger value="instance">Application</Tabs.Trigger>
                <Tabs.Trigger value="updates">Updates</Tabs.Trigger>
                <Tabs.Trigger value="chat">Chat</Tabs.Trigger>
                <Tabs.Trigger value="auth">Authentication</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="instance" class="space-y-6">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Database Status</Card.Title>
                        <Card.Description>
                            View database connection status and health
                        </Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-medium">Status</h4>
                                    <p class="text-sm text-muted-foreground">
                                        {$pbStatus.isRunning ? 'Running' : 'Stopped'}
                                    </p>
                                </div>
                                <Badge variant={$pbStatus.isRunning ? "success" : "destructive"}>
                                    {$pbStatus.isRunning ? "Online" : "Offline"}
                                </Badge>
                            </div>

                            <div class="pt-4 border-t">
                                <Button 
                                    onclick={handleTestConnection}
                                    variant="outline"
                                    class="w-full"
                                >
                                    Test Connection
                                </Button>
                            </div>
                        </div>
                    </Card.Content>
                </Card.Root>

                <Card.Root>
                    <Card.Header>
                        <Card.Title>Instance Settings</Card.Title>
                        <Card.Description>
                            Configure your self-hosted instance
                        </Card.Description>
                    </Card.Header>
                    <Card.Content class="space-y-6">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <Label>Instance Name</Label>
                                <Tooltip.Root>
                                    <Tooltip.Trigger>
                                        <AlertCircle class="w-4 h-4 text-amber-500" />
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                        <p>Instance name customization coming soon</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </div>
                            <Input placeholder="My Instance" disabled class="opacity-50 cursor-not-allowed" />
                            <p class="text-xs text-muted-foreground">A name for your Clairvoyance instance</p>
                        </div>

                        <div class="space-y-2">
                            <Label>Instance URL</Label>
                            <Input placeholder="https://my-instance.example.com" />
                            <p class="text-xs text-muted-foreground">The public URL where your instance is hosted</p>
                        </div>
                    </Card.Content>
                    <Card.Footer>
                        <Button>Save Instance Settings</Button>
                    </Card.Footer>
                </Card.Root>

                <Card.Root>
                    <Card.Header>
                        <Card.Title>Appearance</Card.Title>
                        <Card.Description>
                            Customize your instance appearance
                        </Card.Description>
                    </Card.Header>
                    <Card.Content class="space-y-6">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <Label>Theme</Label>
                                <Tooltip.Root>
                                    <Tooltip.Trigger>
                                        <AlertCircle class="w-4 h-4 text-amber-500" />
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                        <p>Theme customization coming soon</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </div>
                            <Input 
                                value="System" 
                                disabled 
                                class="opacity-50 cursor-not-allowed" 
                            />
                            <p class="text-xs text-muted-foreground">Currently using system theme</p>
                        </div>
                    </Card.Content>
                </Card.Root>

                <Card.Root>
                    <Card.Header>
                        <Card.Title>Notification Settings</Card.Title>
                        <Card.Description>
                            Configure system notifications and alerts
                        </Card.Description>
                    </Card.Header>
                    <Card.Content class="space-y-6">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <Label>SMTP Configuration</Label>
                                <Tooltip.Root>
                                    <Tooltip.Trigger>
                                        <AlertCircle class="w-4 h-4 text-amber-500" />
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                        <p>System notifications coming soon</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </div>
                            <Input disabled class="opacity-50 cursor-not-allowed" placeholder="SMTP Host" />
                            <Input disabled class="opacity-50 cursor-not-allowed" placeholder="SMTP Port" />
                            <Input disabled class="opacity-50 cursor-not-allowed" placeholder="SMTP Username" />
                            <Input disabled class="opacity-50 cursor-not-allowed" type="password" placeholder="SMTP Password" />
                        </div>

                        <div class="space-y-2">
                            <Label>From Address</Label>
                            <Input 
                                disabled 
                                class="opacity-50 cursor-not-allowed" 
                                placeholder="noreply@your-instance.com" 
                            />
                            <p class="text-xs text-muted-foreground">Address used to send notifications and summaries</p>
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
            </Tabs.Content>

            <Tabs.Content value="updates" class="space-y-6">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Manual Updates</Card.Title>
                        <Card.Description>
                            Manually check and apply updates to your instance
                        </Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-medium">Latest Version</h4>
                                    <p class="text-sm text-muted-foreground">v1.0.0-alpha.1 is available</p>
                                </div>
                                <AlertDialog.Root>
                                    <AlertDialog.Trigger asChild>
                                        <Button>Update Now</Button>
                                    </AlertDialog.Trigger>
                                    <AlertDialog.Content>
                                        <AlertDialog.Header>
                                            <AlertDialog.Title class="font-orbitron">
                                                Upgrade Confirmation
                                            </AlertDialog.Title>
                                            <AlertDialog.Description class="space-y-4 font-grotesk">
                                                <p>
                                                    Are you sure you would like to upgrade to v1.0.0-alpha.1?
                                                </p>
                                                <p>
                                                    You can review the changelogs <a href="https://featurebase.app" class="text-primary hover:underline">here</a>.
                                                </p>
                                                <p class="text-amber-600">
                                                    If something goes wrong check 
                                                    <a href="https://docs.auriel.tech" class="underline hover:text-amber-700">this guide</a> on what to do.
                                                </p>
                                            </AlertDialog.Description>
                                        </AlertDialog.Header>
                                        <AlertDialog.Footer>
                                            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                                            <AlertDialog.Action>Continue Update</AlertDialog.Action>
                                        </AlertDialog.Footer>
                                    </AlertDialog.Content>
                                </AlertDialog.Root>
                            </div>
                        </div>
                    </Card.Content>
                </Card.Root>

                <Card.Root>
                    <Card.Header>
                        <Card.Title>Automatic Updates</Card.Title>
                        <Card.Description>
                            Configure instance update preferences
                        </Card.Description>
                    </Card.Header>
                    <Card.Content class="space-y-6">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <Label>Instance Timezone</Label>
                                <Tooltip.Root>
                                    <Tooltip.Trigger>
                                        <AlertCircle class="w-4 h-4 text-amber-500" />
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                        <p>Timezone configuration coming soon</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </div>
                            <Input 
                                value={Intl.DateTimeFormat().resolvedOptions().timeZone} 
                                disabled 
                                class="opacity-50 cursor-not-allowed" 
                            />
                            <p class="text-xs text-muted-foreground">Currently using system timezone</p>
                        </div>

                        <div class="flex items-center justify-between">
                            <div class="space-y-0.5 flex items-center gap-2">
                                <Label>Automatic Updates</Label>
                                <Tooltip.Root>
                                    <Tooltip.Trigger>
                                        <AlertCircle class="w-4 h-4 text-amber-500" />
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                        <p>Automatic updates coming soon</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </div>
                            <Switch.Root disabled class="opacity-50 cursor-not-allowed" />
                        </div>

                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <Label>Check Frequency</Label>
                                <Tooltip.Root>
                                    <Tooltip.Trigger>
                                        <AlertCircle class="w-4 h-4 text-amber-500" />
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                        <p>Update check scheduling coming soon</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </div>
                            <Input 
                                value="hourly" 
                                disabled 
                                class="opacity-50 cursor-not-allowed" 
                            />
                            <p class="text-xs text-muted-foreground">How often to check for updates</p>
                        </div>

                        <div class="space-y-2">
                            <Label>Update Frequency</Label>
                            <Input 
                                value="daily at 00:00" 
                                disabled 
                                class="opacity-50 cursor-not-allowed" 
                            />
                            <p class="text-xs text-muted-foreground">When to apply available updates</p>
                        </div>

                        <div class="space-y-2 pt-2 border-t">
                            <div class="flex justify-between text-sm">
                                <span class="text-muted-foreground">Last updated</span>
                                <span>Never</span>
                            </div>
                        </div>
                    </Card.Content>
                </Card.Root>
            </Tabs.Content>

            <Tabs.Content value="chat" class="space-y-6">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>LLM Provider Settings</Card.Title>
                        <Card.Description>
                            Configure your AI model provider for chat functionality
                        </Card.Description>
                    </Card.Header>
                    <Card.Content class="space-y-6">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <Label>API Provider</Label>
                                <Tooltip.Root>
                                    <Tooltip.Trigger>
                                        <AlertCircle class="w-4 h-4 text-amber-500" />
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                        <p>More providers coming soon</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </div>
                            <Input value="Anthropic" disabled class="opacity-50 cursor-not-allowed" />
                            <p class="text-xs text-muted-foreground">Currently supporting Anthropic Claude only</p>
                        </div>

                        <div class="space-y-2">
                            <Label>API Key</Label>
                            <Input type="password" placeholder="Enter your Anthropic API key" />
                            <p class="text-xs text-muted-foreground">Your API key is stored locally and never leaves your browser</p>
                        </div>
                    </Card.Content>
                    <Card.Footer>
                        <Button>Save API Settings</Button>
                    </Card.Footer>
                </Card.Root>

                <Card.Root>
                    <Card.Header>
                        <Card.Title>Chat Settings</Card.Title>
                        <Card.Description>
                            Configure chat behavior and preferences
                        </Card.Description>
                    </Card.Header>
                    <Card.Content class="space-y-6">
                        <div class="space-y-2">
                            <Label>Model</Label>
                            <Input value="claude-3-sonnet-20240229" disabled class="opacity-50 cursor-not-allowed" />
                            <p class="text-xs text-muted-foreground">Currently using Claude 3 Sonnet</p>
                        </div>

                        <div class="space-y-2">
                            <Label>System Prompt</Label>
                            <Input value="Default Assistant" disabled class="opacity-50 cursor-not-allowed" />
                            <p class="text-xs text-muted-foreground">Custom system prompts coming soon</p>
                        </div>
                    </Card.Content>
                </Card.Root>
            </Tabs.Content>

            <Tabs.Content value="auth" class="space-y-6">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Authentication Settings</Card.Title>
                        <Card.Description>
                            Instance security configuration
                        </Card.Description>
                    </Card.Header>
                    <Card.Content class="space-y-6">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <Label>Access PIN</Label>
                                <Tooltip.Root>
                                    <Tooltip.Trigger>
                                        <AlertCircle class="w-4 h-4 text-amber-500" />
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                        <p>PIN is configured via VITE_AUTH_PIN environment variable</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </div>
                            <div class="relative">
                                <Input 
                                    type={showPin ? "text" : "password"}
                                    value={pin}
                                    disabled 
                                    class="opacity-50 cursor-not-allowed pr-10" 
                                />
                                <button
                                    type="button"
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    onclick={togglePin}
                                >
                                    {#if showPin}
                                        <EyeOff class="h-4 w-4" />
                                    {:else}
                                        <Eye class="h-4 w-4" />
                                    {/if}
                                </button>
                            </div>
                        </div>
                    </Card.Content>
                </Card.Root>

                <Card.Root>
                    <Card.Header>
                        <Card.Title>OAuth Providers</Card.Title>
                        <Card.Description>
                            Configure third-party authentication providers
                        </Card.Description>
                    </Card.Header>
                    <Card.Content class="space-y-6">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <Label>GitHub</Label>
                                <Tooltip.Root>
                                    <Tooltip.Trigger>
                                        <AlertCircle class="w-4 h-4 text-amber-500" />
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                        <p>GitHub OAuth coming soon</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </div>
                            <Input disabled class="opacity-50 cursor-not-allowed" placeholder="GitHub Client ID" />
                            <Input disabled class="opacity-50 cursor-not-allowed" placeholder="GitHub Client Secret" />
                        </div>

                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <Label>Google</Label>
                                <Tooltip.Root>
                                    <Tooltip.Trigger>
                                        <AlertCircle class="w-4 h-4 text-amber-500" />
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                        <p>Google OAuth coming soon</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </div>
                            <Input disabled class="opacity-50 cursor-not-allowed" placeholder="Google Client ID" />
                            <Input disabled class="opacity-50 cursor-not-allowed" placeholder="Google Client Secret" />
                        </div>

                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <Label>Apple</Label>
                                <Tooltip.Root>
                                    <Tooltip.Trigger>
                                        <AlertCircle class="w-4 h-4 text-amber-500" />
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                        <p>Apple Sign In coming soon</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </div>
                            <Input disabled class="opacity-50 cursor-not-allowed" placeholder="Apple Service ID" />
                            <Input disabled class="opacity-50 cursor-not-allowed" placeholder="Apple Private Key" />
                        </div>
                    </Card.Content>
                </Card.Root>

                <Card.Root>
                    <Card.Header>
                        <Card.Title>Security Settings</Card.Title>
                        <Card.Description>
                            Additional security controls
                        </Card.Description>
                    </Card.Header>
                    <Card.Content class="space-y-6">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <Label>Session Timeout</Label>
                                <Tooltip.Root>
                                    <Tooltip.Trigger>
                                        <AlertCircle class="w-4 h-4 text-amber-500" />
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                        <p>Session management coming soon</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </div>
                            <Input 
                                disabled 
                                class="opacity-50 cursor-not-allowed" 
                                placeholder="60 minutes" 
                            />
                        </div>

                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <Label>IP Allowlist</Label>
                                <Tooltip.Root>
                                    <Tooltip.Trigger>
                                        <AlertCircle class="w-4 h-4 text-amber-500" />
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                        <p>IP restrictions coming soon</p>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </div>
                            <Input 
                                disabled 
                                class="opacity-50 cursor-not-allowed" 
                                placeholder="Enter allowed IP addresses" 
                            />
                        </div>
                    </Card.Content>
                </Card.Root>
            </Tabs.Content>
        </Tabs.Root>
    </div>
</PageContent> 
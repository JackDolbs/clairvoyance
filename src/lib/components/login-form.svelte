<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { AlertTriangle } from 'lucide-svelte';
</script>

<Card.Root class="mx-auto px-5 max-w-lg">
	<Card.Header>
		<Card.Title class="text-2xl mb-2">Welcome Back</Card.Title>
		<Card.Description>Email login is not available in pre-alpha.</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="grid gap-4">
			<div class="flex items-start gap-4 p-4 rounded-lg bg-amber-50 text-amber-900">
				<AlertTriangle class="w-5 h-5 mt-0.5" />
				<div class="grid gap-1">
					<p class="text-sm font-medium">
						Email login is disabled
					</p>
					<p class="text-sm text-amber-800">
						During pre-alpha, please use your PIN code to access the app. 
						User management will be available soon.
					</p>
				</div>
			</div>
			<Button variant="outline" class="w-full mt-5" href="/auth/protected">
				Back to PIN Login
			</Button>
		</div>
	</Card.Content>
</Card.Root>

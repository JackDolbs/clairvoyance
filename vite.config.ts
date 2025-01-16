import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { execSync } from 'child_process';

const getGitHash = () => {
	try {
		return execSync('git rev-parse --short HEAD').toString().trim();
	} catch {
		return 'unknown';
	}
};

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__COMMIT_HASH__: JSON.stringify(getGitHash()),
		__APP_VERSION__: JSON.stringify(process.env.npm_package_version),
	}
});

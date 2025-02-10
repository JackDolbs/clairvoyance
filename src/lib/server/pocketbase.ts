import { spawn } from 'child_process';
import path from 'path';
import PocketBase from 'pocketbase';

let pocketbaseProcess: any = null;

export function startPocketBase() {
    console.log('=== Starting PocketBase Process ===');
    console.log('Current directory:', process.cwd());
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Process arguments:', process.argv);

    // Don't start if we're building
    if (process.env.NODE_ENV === 'production' && process.argv.includes('build')) {
        console.log('Skipping PocketBase start during build');
        return;
    }

    // Kill existing instance if running
    if (pocketbaseProcess) {
        console.log('Killing existing PocketBase process');
        pocketbaseProcess.kill();
        pocketbaseProcess = null;
    }

    const pbPath = process.env.NODE_ENV === 'production' 
        ? path.resolve(process.cwd(), 'pocketbase/pocketbase')
        : path.resolve(process.cwd(), 'src/lib/pocketbase/pocketbase');
    
    console.log('PocketBase executable path:', pbPath);
    console.log('Checking if file exists:', require('fs').existsSync(pbPath));
    
    try {
        pocketbaseProcess = spawn(pbPath, [
            'serve',
            '--http=127.0.0.1:8090',
            '--dir=./pb_data'
        ], { stdio: 'pipe' }); // Change to pipe to capture output

        console.log('PocketBase process spawned with PID:', pocketbaseProcess.pid);

        pocketbaseProcess.stdout.on('data', (data: Buffer) => {
            console.log(`PocketBase stdout: ${data}`);
        });

        pocketbaseProcess.stderr.on('data', (data: Buffer) => {
            console.error(`PocketBase stderr: ${data}`);
        });

        pocketbaseProcess.on('error', (err: Error) => {
            console.error('Failed to start PocketBase process:', err);
        });

        pocketbaseProcess.on('exit', (code: number, signal: string) => {
            console.log('PocketBase process exited with code:', code, 'signal:', signal);
        });

        return pocketbaseProcess;
    } catch (err) {
        console.error('Error spawning PocketBase process:', err);
        throw err;
    }
}

// Add shutdown handler
process.on('exit', () => {
    if (pocketbaseProcess) {
        console.log('Shutting down PocketBase process');
        pocketbaseProcess.kill();
    }
});

export function createPocketBaseServer() {
    console.log('Creating new PocketBase server instance');
    const pb = new PocketBase('http://127.0.0.1:8090');
    return pb;
} 
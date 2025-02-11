import { spawn } from 'child_process';
import path from 'path';
import PocketBase from 'pocketbase';
import fs from 'fs';

let pocketbaseProcess: any = null;

export function startPocketBase() {
    console.log('=== Starting PocketBase Process ===');
    console.log('Current directory:', process.cwd());
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Process arguments:', process.argv);
    console.log('Directory contents:', fs.readdirSync(process.cwd()));

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

    // Ensure pb_data directory exists
    const dataDir = path.join(process.cwd(), 'pb_data');
    if (!fs.existsSync(dataDir)) {
        console.log('Creating pb_data directory');
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const pbPath = process.env.NODE_ENV === 'production' 
        ? path.resolve(process.cwd(), 'pocketbase/pocketbase')
        : path.resolve(process.cwd(), 'src/lib/pocketbase/pocketbase');
    
    console.log('PocketBase executable path:', pbPath);
    console.log('Checking if file exists:', fs.existsSync(pbPath));
    console.log('File permissions:', fs.statSync(pbPath).mode.toString(8));
    
    try {
        // Ensure executable permissions
        fs.chmodSync(pbPath, '755');
        
        console.log('Starting PocketBase process...');
        pocketbaseProcess = spawn(pbPath, [
            'serve',
            '--http=127.0.0.1:8090',
            '--dir=./pb_data'
        ], { 
            stdio: 'pipe',
            env: {
                ...process.env,
                NODE_ENV: process.env.NODE_ENV || 'production'
            }
        });

        console.log('PocketBase process spawned with PID:', pocketbaseProcess.pid);

        pocketbaseProcess.stdout.on('data', (data: Buffer) => {
            console.log(`PocketBase stdout: ${data.toString()}`);
        });

        pocketbaseProcess.stderr.on('data', (data: Buffer) => {
            console.error(`PocketBase stderr: ${data.toString()}`);
        });

        pocketbaseProcess.on('error', (err: Error) => {
            console.error('Failed to start PocketBase process:', err);
            console.error('Error details:', {
                name: err.name,
                message: err.message,
                stack: err.stack
            });
        });

        pocketbaseProcess.on('exit', (code: number, signal: string) => {
            console.log('PocketBase process exited with code:', code, 'signal:', signal);
            // Attempt to restart if crashed
            if (code !== 0 && !signal) {
                console.log('PocketBase crashed, attempting restart...');
                setTimeout(startPocketBase, 1000);
            }
        });

        // Wait for process to be ready
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('PocketBase start timeout'));
            }, 10000);

            pocketbaseProcess.stdout.on('data', (data: Buffer) => {
                if (data.toString().includes('Server started')) {
                    clearTimeout(timeout);
                    resolve(pocketbaseProcess);
                }
            });
        });

    } catch (err) {
        console.error('Error spawning PocketBase process:', err);
        if (err instanceof Error) {
            console.error('Stack trace:', err.stack);
        }
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

// Handle other termination signals
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
    process.on(signal, () => {
        console.log(`Received ${signal}, shutting down...`);
        if (pocketbaseProcess) {
            pocketbaseProcess.kill();
        }
        process.exit(0);
    });
});

export function createPocketBaseServer() {
    console.log('Creating new PocketBase server instance');
    const pb = new PocketBase('http://127.0.0.1:8090');
    return pb;
} 
import { spawn } from 'child_process';
import path from 'path';
import PocketBase from 'pocketbase';
import fs from 'fs';

let pocketbaseProcess: any = null;
let isStarting = false;
let startPromise: Promise<any> | null = null;

export async function startPocketBase() {
    // If already starting, return existing promise
    if (isStarting && startPromise) {
        return startPromise;
    }

    isStarting = true;
    console.log('=== Starting PocketBase Process ===');
    console.log('Current directory:', process.cwd());
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    startPromise = new Promise(async (resolve, reject) => {
        try {
            const pbPath = process.env.NODE_ENV === 'production' 
                ? path.resolve(process.cwd(), 'build/pocketbase/pocketbase')
                : path.resolve(process.cwd(), 'src/lib/pocketbase/pocketbase');
            
            console.log('PocketBase executable path:', pbPath);
            
            // Check if file exists and is executable
            if (!fs.existsSync(pbPath)) {
                throw new Error(`PocketBase executable not found at ${pbPath}`);
            }

            // Just check if we can execute it
            fs.accessSync(pbPath, fs.constants.X_OK);
            console.log('Executable permissions verified');

            // Set permissions just to be sure
            fs.chmodSync(pbPath, 0o755);
            
            // Ensure pb_data directory exists
            const dataDir = path.join(process.cwd(), 'pb_data');
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // Kill existing instance if running
            if (pocketbaseProcess) {
                pocketbaseProcess.kill();
                pocketbaseProcess = null;
            }

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

            // Wait for server to be ready
            const serverReady = new Promise((resolveServer, rejectServer) => {
                const timeout = setTimeout(() => {
                    rejectServer(new Error('PocketBase start timeout'));
                }, 10000);

                pocketbaseProcess.stdout.on('data', (data: Buffer) => {
                    const output = data.toString();
                    console.log(`PocketBase stdout: ${output}`);
                    if (output.includes('Server started')) {
                        clearTimeout(timeout);
                        resolveServer(true);
                    }
                });

                pocketbaseProcess.stderr.on('data', (data: Buffer) => {
                    console.error(`PocketBase stderr: ${data.toString()}`);
                });

                pocketbaseProcess.on('error', (err: Error) => {
                    console.error('PocketBase process error:', err);
                    clearTimeout(timeout);
                    rejectServer(err);
                });

                pocketbaseProcess.on('exit', (code: number, signal: string) => {
                    console.log(`PocketBase exited with code ${code} and signal ${signal}`);
                    if (code !== 0) {
                        rejectServer(new Error(`PocketBase exited with code ${code}`));
                    }
                });
            });

            await serverReady;
            console.log('PocketBase server is ready');
            resolve(true);

        } catch (err) {
            console.error('Failed to start PocketBase:', err);
            reject(err);
        } finally {
            isStarting = false;
        }
    });

    return startPromise;
}

export function createPocketBaseServer() {
    if (!pocketbaseProcess) {
        throw new Error('PocketBase server not started');
    }
    console.log('Creating new PocketBase instance');
    return new PocketBase('http://127.0.0.1:8090');
}

// Cleanup handlers
process.on('exit', () => {
    if (pocketbaseProcess) {
        pocketbaseProcess.kill();
    }
});

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
    process.on(signal, () => {
        if (pocketbaseProcess) {
            pocketbaseProcess.kill();
        }
        process.exit(0);
    });
}); 
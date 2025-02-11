import { spawn } from 'child_process';
import path from 'path';
import PocketBase from 'pocketbase';
import fs from 'fs';

let pocketbaseProcess: any = null;
let isStarting = false;
let startPromise: Promise<any> | null = null;

export async function startPocketBase() {
    const pbPath = path.join(process.cwd(), 'pocketbase');
    
    try {
        // Start PocketBase process
        const pb = spawn(pbPath, ['serve', '--http=127.0.0.1:8090'], {
            stdio: 'pipe'
        });

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
                pocketbaseProcess = pb;

                // Wait for server to be ready
                const serverReady = new Promise((resolveServer, rejectServer) => {
                    const timeout = setTimeout(() => {
                        rejectServer(new Error('PocketBase start timeout'));
                    }, 10000);

                    pb.stdout.on('data', (data: Buffer) => {
                        const output = data.toString();
                        console.log(`PocketBase stdout: ${output}`);
                        if (output.includes('Server started')) {
                            clearTimeout(timeout);
                            resolveServer(true);
                        }
                    });

                    pb.stderr.on('data', (data: Buffer) => {
                        console.error(`PocketBase stderr: ${data.toString()}`);
                    });

                    pb.on('error', (err: Error) => {
                        console.error('PocketBase process error:', err);
                        clearTimeout(timeout);
                        rejectServer(err);
                    });

                    pb.on('exit', (code: number, signal: string) => {
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
                if (err instanceof Error) {
                    console.error('Stack trace:', err.stack);
                }
                throw err;
            } finally {
                isStarting = false;
            }
        });

        return startPromise;

    } catch (error) {
        console.error('Failed to start PocketBase:', error);
        throw error;
    }
}

export function createPocketBaseServer() {
    // In production, connect to external PocketBase instance
    if (process.env.NODE_ENV === 'production') {
        const pbUrl = process.env.POCKETBASE_URL || 'http://localhost:8090';
        console.log(`Connecting to PocketBase at ${pbUrl}`);
        return new PocketBase(pbUrl);
    }

    // Development code
    if (!pocketbaseProcess) {
        console.warn('PocketBase server not started, creating client with default URL');
        return new PocketBase('http://localhost:8090');
    }
    return new PocketBase('http://localhost:8090');
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
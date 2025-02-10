import { spawn } from 'child_process';
import path from 'path';
import PocketBase from 'pocketbase';

let pocketbaseProcess: any = null;

export function startPocketBase() {
    // Add debug logging
    console.log('Starting PocketBase process...');
    console.log('Current directory:', process.cwd());
    console.log('NODE_ENV:', process.env.NODE_ENV);

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

    // In production, use the embedded PocketBase executable
    const pbPath = process.env.NODE_ENV === 'production' 
        ? path.resolve(process.cwd(), 'pocketbase/pocketbase')
        : path.resolve(process.cwd(), 'src/lib/pocketbase/pocketbase');
    
    console.log('PocketBase path:', pbPath);
    
    pocketbaseProcess = spawn(pbPath, [
        'serve',
        '--http=127.0.0.1:8090',  // Listen only on localhost in production
        '--dir=./pb_data'
    ]);

    pocketbaseProcess.stdout.on('data', (data: Buffer) => {
        console.log(`PocketBase: ${data}`);
    });

    pocketbaseProcess.stderr.on('data', (data: Buffer) => {
        console.error(`PocketBase Error: ${data}`);
    });

    return pocketbaseProcess;
}

// Add shutdown handler
process.on('exit', () => {
    if (pocketbaseProcess) {
        pocketbaseProcess.kill();
    }
});

export function createPocketBaseServer() {
    // Always connect to local instance
    const pb = new PocketBase('http://127.0.0.1:8090');
    return pb;
} 
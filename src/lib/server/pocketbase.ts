import { spawn } from 'child_process';
import path from 'path';

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

    const pbPath = path.resolve(process.cwd(), 'src/lib/pocketbase/pocketbase');
    console.log('PocketBase path:', pbPath);
    
    pocketbaseProcess = spawn(pbPath, [
        'serve',
        '--http=0.0.0.0:8090',  // Listen on all interfaces
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
import { spawn } from 'child_process';
import path from 'path';

let pocketbaseProcess: any = null;

export function startPocketBase() {
    // Don't start if we're building
    if (process.env.NODE_ENV === 'production' && process.argv.includes('build')) {
        console.log('Skipping PocketBase start during build');
        return;
    }

    // Kill existing instance if running
    if (pocketbaseProcess) {
        pocketbaseProcess.kill();
        pocketbaseProcess = null;
    }

    const pbPath = path.resolve(process.cwd(), 'src/lib/pocketbase/pocketbase');
    
    pocketbaseProcess = spawn(pbPath, [
        'serve',
        '--http=localhost:8090',
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
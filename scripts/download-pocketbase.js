import { platform } from 'os';
import { execSync } from 'child_process';
import fs from 'fs';

const VERSION = 'v0.19.4';
const BASE_URL = 'https://github.com/pocketbase/pocketbase/releases/download';

// Determine platform-specific binary
const os = platform();
const binaryName = os === 'win32' ? 'windows_amd64' :
                  os === 'darwin' ? process.arch === 'arm64' ? 'darwin_arm64' : 'darwin_amd64' :
                  'linux_amd64';

const downloadUrl = `${BASE_URL}/${VERSION}/pocketbase_${VERSION.substring(1)}_${binaryName}.zip`;

// Install unzip if not present
try {
    execSync('which unzip');
} catch (error) {
    console.log('Installing unzip...');
    execSync('apt-get update && apt-get install -y unzip');
}

try {
    console.log(`Downloading PocketBase for ${binaryName}...`);
    execSync(`curl -L ${downloadUrl} --output pb.zip`);
    // Extract only the pocketbase binary
    execSync('unzip -jo pb.zip pocketbase -d .');
    execSync('chmod +x pocketbase');
    execSync('rm pb.zip');
    // Clean up unnecessary files
    if (fs.existsSync('CHANGELOG.md')) fs.unlinkSync('CHANGELOG.md');
    console.log('PocketBase downloaded and extracted successfully');
} catch (error) {
    console.error('Error downloading PocketBase:', error);
    process.exit(1);
} 
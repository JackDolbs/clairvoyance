import { platform } from 'os';
import { execSync } from 'child_process';

const VERSION = 'v0.19.4';
const BASE_URL = 'https://github.com/pocketbase/pocketbase/releases/download';

// Determine platform-specific binary
const os = platform();
const arch = process.arch;
let binaryName;

if (os === 'darwin') {
    binaryName = arch === 'arm64' ? 'darwin_arm64' : 'darwin_amd64';
} else if (os === 'linux') {
    binaryName = 'linux_amd64';
} else {
    console.error('Unsupported platform');
    process.exit(1);
}

const downloadUrl = `${BASE_URL}/${VERSION}/pocketbase_${VERSION.substring(1)}_${binaryName}.zip`;

// Install unzip if not present
try {
  execSync('which unzip');
} catch (error) {
  console.log('Installing unzip...');
  execSync('apt-get update && apt-get install -y unzip');
}

try {
    // Download and extract PocketBase
    console.log(`Downloading PocketBase for ${binaryName}...`);
    execSync(`curl -L ${downloadUrl} -o pb.zip`);
    execSync('unzip -o pb.zip');
    execSync('chmod +x pocketbase');
    execSync('rm pb.zip');
    console.log('PocketBase downloaded and extracted successfully');
} catch (error) {
    console.error('Error downloading PocketBase:', error);
    process.exit(1);
} 
import { pb } from './pocketbase';

export interface Backup {
    id: string;
    name: string;
    size: number;
    created: Date;
}

// Modified to work in browser
async function listBackups(): Promise<Backup[]> {
    try {
        // Use PocketBase API instead of filesystem
        const response = await pb.send('/api/backups', {
            method: 'GET',
        });
        
        return response.items.map((backup: any) => ({
            id: backup.id,
            name: backup.filename,
            size: backup.size,
            created: new Date(backup.created)
        }));
    } catch (err) {
        console.error('Error listing backups:', err);
        return [];
    }
}

async function createBackup(): Promise<boolean> {
    try {
        const timestamp = Date.now();
        await pb.backupCreate({ name: `auto-backup-${timestamp}` });
        return true;
    } catch (err) {
        console.error('Backup creation failed:', err);
        return false;
    }
}

async function restoreBackup(backupId: string): Promise<boolean> {
    try {
        await pb.send(`/api/backups/${backupId}/restore`, {
            method: 'POST',
        });
        return true;
    } catch (err) {
        console.error('Backup restoration failed:', err);
        return false;
    }
}

export { createBackup, listBackups, restoreBackup }; 
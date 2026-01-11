
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomDeck } from '../types';

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const FILE_NAME = 'english-reflex-gym-data.json';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

// Initialize GAPI and GIS
export const initGoogleDrive = (clientId: string, onInitComplete: (success: boolean) => void) => {
  if (!clientId) {
    console.warn("No Client ID provided");
    onInitComplete(false);
    return;
  }

  const gapiLoaded = () => {
    (window as any).gapi.load('client', async () => {
      await (window as any).gapi.client.init({
        apiKey: '', // Drive API doesn't need API Key for this flow, just token
        discoveryDocs: [DISCOVERY_DOC],
      });
      gapiInited = true;
      checkInit();
    });
  };

  const gisLoaded = () => {
    tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: '', // Defined at request time
      error_callback: (err: any) => {
         console.error("GIS Error:", err);
      }
    });
    gisInited = true;
    checkInit();
  };

  const checkInit = () => {
    if (gapiInited && gisInited) {
      onInitComplete(true);
    }
  };

  if ((window as any).gapi) gapiLoaded();
  if ((window as any).google) gisLoaded();
};

// Sign In trigger
// forceAccountSelect: true will prompt the user to choose an account again
export const signInToGoogle = (forceAccountSelect: boolean = false): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject("Google Client not initialized");
    
    tokenClient.callback = async (resp: any) => {
      if (resp.error) {
        // Normalize error for easier handling in UI
        if (resp.error === 'access_denied') {
            reject(new Error("ACCESS_DENIED_TEST_USER"));
        } else {
            reject(resp);
        }
        return;
      }
      resolve(resp.access_token);
    };

    // Prompt user to select account if not already or expired
    // prompt: 'consent' forces approval screen
    // prompt: 'select_account' forces account chooser
    const promptValue = forceAccountSelect ? 'select_account' : '';
    tokenClient.requestAccessToken({ prompt: promptValue });
  });
};

// Disconnect / Revoke Token
export const disconnectGoogle = (): void => {
    const accessToken = (window as any).gapi?.client?.getToken()?.access_token;
    if (accessToken) {
        (window as any).google.accounts.oauth2.revoke(accessToken, () => {
            console.log('Access token revoked');
        });
        (window as any).gapi.client.setToken(null);
    }
};

// Find the file on Drive
const findFile = async (): Promise<any> => {
  const response = await (window as any).gapi.client.drive.files.list({
    q: `name = '${FILE_NAME}' and trashed = false`,
    fields: 'files(id, name, modifiedTime)',
    spaces: 'drive',
  });
  const files = response.result.files;
  if (files && files.length > 0) {
    return files[0];
  }
  return null;
};

// Create new file
const createFile = async (data: CustomDeck[]): Promise<any> => {
  const fileContent = JSON.stringify(data, null, 2);
  const file = new Blob([fileContent], { type: 'application/json' });
  const metadata = {
    name: FILE_NAME,
    mimeType: 'application/json',
  };

  const accessToken = (window as any).gapi.client.getToken().access_token;
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
    body: form,
  });
  return await res.json();
};

// Update existing file
const updateFile = async (fileId: string, data: CustomDeck[]): Promise<any> => {
  const fileContent = JSON.stringify(data, null, 2);
  const file = new Blob([fileContent], { type: 'application/json' });

  const accessToken = (window as any).gapi.client.getToken().access_token;
  // Use PATCH for updating content
  const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: new Headers({ 
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
    }),
    body: fileContent,
  });
  return await res.json();
};

// Read file content
const readFile = async (fileId: string): Promise<CustomDeck[]> => {
  const response = await (window as any).gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media',
  });
  return response.result || response.body; 
};

// Main Sync Function with Conflict Resolution
export const syncWithDrive = async (localDecks: CustomDeck[]): Promise<{ decks: CustomDeck[], lastSynced: string }> => {
  // Check if we have a token
  if (!(window as any).gapi?.client?.getToken()) {
     throw new Error("AUTH_REQUIRED");
  }

  const driveFile = await findFile();
  
  if (!driveFile) {
    // No file on drive? Just upload local
    await createFile(localDecks);
    return { decks: localDecks, lastSynced: new Date().toISOString() };
  } else {
    const driveData: CustomDeck[] = await readFile(driveFile.id);
    
    // Conflict Resolution Map
    const mergedMap = new Map<string, CustomDeck>();

    // 1. Put all Drive decks in map
    driveData.forEach(d => mergedMap.set(d.id, d));

    // 2. Iterate local decks and compare
    localDecks.forEach(local => {
        const remote = mergedMap.get(local.id);
        
        if (!remote) {
            // New local deck, add to map
            mergedMap.set(local.id, local);
        } else {
            // Conflict: Check timestamps
            // Default to 0 if undefined (legacy data)
            const localTime = local.updatedAt || local.createdAt || 0;
            const remoteTime = remote.updatedAt || remote.createdAt || 0;

            // If local is newer or equal, overwrite remote in map
            if (localTime >= remoteTime) {
                mergedMap.set(local.id, local);
            }
            // Else: Keep remote (it is newer), do nothing
        }
    });

    const merged = Array.from(mergedMap.values());
    
    // 3. Update Drive if data changed (naive check: simple length or just always update to be safe)
    // To be efficient, we could check JSON string equality, but for small files, just updating is fine.
    // However, let's try to avoid unnecessary writes if exact match.
    if (JSON.stringify(merged) !== JSON.stringify(driveData)) {
       await updateFile(driveFile.id, merged);
    }

    return { decks: merged, lastSynced: new Date().toISOString() };
  }
};

export const saveToDrive = async (decks: CustomDeck[]): Promise<string> => {
    // Direct Save (Overwrite) - typically used after a decisive action like delete
    // But safely we should probably re-sync? 
    // For now, let's assume the calling component (DataManager) holds the "truth" 
    // immediately after an edit action.
    const driveFile = await findFile();
    if (driveFile) {
        await updateFile(driveFile.id, decks);
        return new Date().toISOString();
    } else {
        await createFile(decks);
        return new Date().toISOString();
    }
};

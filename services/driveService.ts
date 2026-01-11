
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
export const signInToGoogle = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject("Google Client not initialized");
    
    tokenClient.callback = async (resp: any) => {
      if (resp.error) {
        reject(resp);
      }
      resolve(resp.access_token);
    };

    // Prompt user to select account if not already or expired
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
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
  const form = new FormData();
  // For update, we usually use PATCH method to upload URL
  // But standard fetch is easier for multipart
  
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
  // gapi returns body in .result for 'media' alt depending on config, but mostly it parses JSON automatically if header matches
  return response.result || response.body; 
};

// Main Sync Function: Returns merged decks and timestamp
export const syncWithDrive = async (localDecks: CustomDeck[]): Promise<{ decks: CustomDeck[], lastSynced: string }> => {
  const driveFile = await findFile();
  
  if (!driveFile) {
    // Case 1: File doesn't exist on Drive -> Upload Local
    await createFile(localDecks);
    return { decks: localDecks, lastSynced: new Date().toISOString() };
  } else {
    // Case 2: File exists -> Download Drive Data
    const driveData: CustomDeck[] = await readFile(driveFile.id);
    
    // Simple Merge Strategy: ID-based.
    // In a real app, we'd check timestamps. Here we prioritize preserving data.
    // We combine both lists. If ID exists in both, we take the one from Drive (Server wins policy for simplicity in this manual sync context) 
    // OR we can implement "Last Write Wins" if we tracked modification time per deck.
    
    // Let's do a smart union:
    const driveIds = new Set(driveData.map(d => d.id));
    const uniqueLocal = localDecks.filter(d => !driveIds.has(d.id));
    
    // Result = All Drive Data + Local Data that wasn't on Drive
    const merged = [...driveData, ...uniqueLocal];
    
    // If the merged result is different from what was on Drive (meaning we added local stuff), update Drive
    if (merged.length > driveData.length) {
       await updateFile(driveFile.id, merged);
    }

    return { decks: merged, lastSynced: driveFile.modifiedTime };
  }
};

// Force Push (Save Local to Drive, overwriting Drive)
export const saveToDrive = async (decks: CustomDeck[]): Promise<string> => {
    const driveFile = await findFile();
    if (driveFile) {
        await updateFile(driveFile.id, decks);
        return new Date().toISOString();
    } else {
        await createFile(decks);
        return new Date().toISOString();
    }
};

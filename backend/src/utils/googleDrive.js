import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEYFILEPATH = path.join(__dirname, '../../../frontend/src/socialhive_serviceaccount_key.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

export const uploadFile = async (filePath, fileName) => {
  try {
    const fileMetadata = {
      name: fileName,
      parents: ['1V0vKVb61HH18GLsMGrs8zumHjrBg_dUA'], // Replace with your folder ID
    };

    const media = {
      mimeType: 'application/octet-stream',
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};
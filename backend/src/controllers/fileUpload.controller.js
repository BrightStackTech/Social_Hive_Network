import { uploadFile as uploadToDrive } from '../utils/googleDrive.js';
import path from 'path';
import fs from 'fs';

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      throw new Error('No file uploaded');
    }
    const filePath = path.join(__dirname, '../../uploads', file.filename);
    const result = await uploadToDrive(filePath, file.originalname);

    // Delete the file from server after upload
    fs.unlinkSync(filePath);

    res.status(200).json({ link: result.webViewLink });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: error.message });
  }
};
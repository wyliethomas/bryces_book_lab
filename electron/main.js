import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import Database from './database.js';
import AIService from './ai-service.js';
import PDFGenerator from './pdf-generator.js';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let database;
let aiService;
let pdfGenerator;
let dbPath; // Store database path for backup/restore

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#ffffff',
  });

  // Load the app
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    // Development mode - load from Vite dev server
    mainWindow.loadURL('http://localhost:5173').catch((err) => {
      console.error('Failed to load dev server:', err);
      console.log('Make sure Vite dev server is running on http://localhost:5173');
    });
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - load built files
    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('Failed to load production build:', err);
      console.log('Run "npm run build" first to create the dist folder');
    });
  }

  // Helpful error logging
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    if (isDev) {
      console.log('Tip: Make sure Vite is running (npm run dev)');
    } else {
      console.log('Tip: Run "npm run build" to create production files');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize services
async function initializeServices() {
  console.log('🚀 Initializing services...');
  const userDataPath = app.getPath('userData');
  dbPath = path.join(userDataPath, 'books.db'); // Store globally for backup/restore
  console.log('📁 Database path:', dbPath);

  try {
    database = new Database(dbPath);
    console.log('✅ Database initialized');

    aiService = new AIService(database);
    await aiService.initialize();
    console.log('✅ AI Service initialized');

    pdfGenerator = new PDFGenerator(database);
    console.log('✅ PDF Generator initialized');

    console.log('🎉 All services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    // Don't throw error if AI service initialization fails - user might need to configure it
    if (error.message.includes('API key') || error.message.includes('configure')) {
      console.log('⚠️ AI Service needs configuration. User will be prompted during onboarding.');
    } else {
      throw error;
    }
  }
}

// Books IPC Handlers
ipcMain.handle('books:getAll', async () => {
  return database.getAllBooks();
});

ipcMain.handle('books:getById', async (event, id) => {
  return database.getBookById(id);
});

ipcMain.handle('books:create', async (event, book) => {
  try {
    console.log('📚 [IPC] Creating book:', book);
    const result = database.createBook(book);
    console.log('✅ [IPC] Book created successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ [IPC] Error creating book:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
});

ipcMain.handle('books:update', async (event, id, book) => {
  return database.updateBook(id, book);
});

ipcMain.handle('books:delete', async (event, id) => {
  return database.deleteBook(id);
});

// Chapters IPC Handlers
ipcMain.handle('chapters:getByBookId', async (event, bookId) => {
  return database.getChaptersByBookId(bookId);
});

ipcMain.handle('chapters:getById', async (event, id) => {
  return database.getChapterById(id);
});

ipcMain.handle('chapters:create', async (event, chapter) => {
  return database.createChapter(chapter);
});

ipcMain.handle('chapters:update', async (event, id, chapter) => {
  return database.updateChapter(id, chapter);
});

ipcMain.handle('chapters:delete', async (event, id) => {
  return database.deleteChapter(id);
});

ipcMain.handle('chapters:reorder', async (event, bookId, chapterIds) => {
  return database.reorderChapters(bookId, chapterIds);
});

// Notes IPC Handlers
ipcMain.handle('notes:getAll', async () => {
  return database.getAllNotes();
});

ipcMain.handle('notes:create', async (event, note) => {
  return database.createNote(note);
});

ipcMain.handle('notes:process', async (event, text) => {
  return aiService.processNotes(text);
});

// Topics IPC Handlers
ipcMain.handle('topics:getAll', async () => {
  return database.getAllTopics();
});

ipcMain.handle('topics:getById', async (event, id) => {
  return database.getTopicById(id);
});

ipcMain.handle('topics:getNotes', async (event, topicId) => {
  return database.getNotesByTopicId(topicId);
});

// AI IPC Handlers
ipcMain.handle('ai:extractTopics', async (event, text) => {
  return aiService.extractTopics(text);
});

ipcMain.handle('ai:generateOutline', async (event, topic, notes) => {
  return aiService.generateOutline(topic, notes);
});

ipcMain.handle('ai:refineOutline', async (event, outline, instructions) => {
  return aiService.refineOutline(outline, instructions);
});

ipcMain.handle('ai:generateChapter', async (event, outline, notes) => {
  return aiService.generateChapter(outline, notes);
});

ipcMain.handle('ai:refineContent', async (event, content, instructions) => {
  return aiService.refineContent(content, instructions);
});

// PDF IPC Handlers
ipcMain.handle('pdf:generateBook', async (event, bookId) => {
  return pdfGenerator.generateBookPDF(bookId);
});

// Settings IPC Handlers
ipcMain.handle('settings:get', async (event, key) => {
  return database.getDecryptedSetting(key);
});

ipcMain.handle('settings:set', async (event, key, value) => {
  return database.setSetting(key, value);
});

// Backup IPC Handlers
ipcMain.handle('backup:export', async () => {
  try {
    // Show save dialog
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Backup',
      defaultPath: `bryces-book-lab-backup-${new Date().toISOString().split('T')[0]}.db`,
      filters: [
        { name: 'Database Backup', extensions: ['db'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled) {
      return { success: false, cancelled: true };
    }

    // Copy database file to selected location
    fs.copyFileSync(dbPath, result.filePath);

    console.log('✅ Backup created:', result.filePath);
    return { success: true, path: result.filePath };
  } catch (error) {
    console.error('❌ Backup failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('backup:import', async () => {
  try {
    // Show open dialog
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Backup',
      filters: [
        { name: 'Database Backup', extensions: ['db'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled) {
      return { success: false, cancelled: true };
    }

    const backupPath = result.filePaths[0];

    // Close database connection
    if (database) {
      database.close();
    }

    // Replace database file
    fs.copyFileSync(backupPath, dbPath);

    console.log('✅ Backup restored from:', backupPath);

    // Restart the app
    app.relaunch();
    app.exit(0);

    return { success: true };
  } catch (error) {
    console.error('❌ Restore failed:', error);

    // Try to reinitialize database if restore failed
    try {
      await initializeServices();
    } catch (reinitError) {
      console.error('❌ Failed to reinitialize:', reinitError);
    }

    return { success: false, error: error.message };
  }
});

// App lifecycle
app.whenReady().then(async () => {
  await initializeServices();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (database) {
    database.close();
  }
});

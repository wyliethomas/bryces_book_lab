const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Books operations
  books: {
    getAll: () => ipcRenderer.invoke('books:getAll'),
    getById: (id) => ipcRenderer.invoke('books:getById', id),
    create: (book) => ipcRenderer.invoke('books:create', book),
    update: (id, book) => ipcRenderer.invoke('books:update', id, book),
    delete: (id) => ipcRenderer.invoke('books:delete', id),
  },

  // Chapters operations
  chapters: {
    getByBookId: (bookId) => ipcRenderer.invoke('chapters:getByBookId', bookId),
    getById: (id) => ipcRenderer.invoke('chapters:getById', id),
    create: (chapter) => ipcRenderer.invoke('chapters:create', chapter),
    update: (id, chapter) => ipcRenderer.invoke('chapters:update', id, chapter),
    delete: (id) => ipcRenderer.invoke('chapters:delete', id),
    reorder: (bookId, chapterIds) => ipcRenderer.invoke('chapters:reorder', bookId, chapterIds),
  },

  // Notes operations
  notes: {
    getAll: () => ipcRenderer.invoke('notes:getAll'),
    create: (note) => ipcRenderer.invoke('notes:create', note),
    processNotes: (text) => ipcRenderer.invoke('notes:process', text),
  },

  // Topics operations
  topics: {
    getAll: () => ipcRenderer.invoke('topics:getAll'),
    getById: (id) => ipcRenderer.invoke('topics:getById', id),
    getNotesByTopic: (topicId) => ipcRenderer.invoke('topics:getNotes', topicId),
  },

  // AI operations
  ai: {
    extractTopics: (text) => ipcRenderer.invoke('ai:extractTopics', text),
    generateOutline: (topic, notes) => ipcRenderer.invoke('ai:generateOutline', topic, notes),
    refineOutline: (outline, instructions) => ipcRenderer.invoke('ai:refineOutline', outline, instructions),
    generateChapter: (outline, notes) => ipcRenderer.invoke('ai:generateChapter', outline, notes),
    refineContent: (content, instructions) => ipcRenderer.invoke('ai:refineContent', content, instructions),
  },

  // PDF operations
  pdf: {
    generateBook: (bookId) => ipcRenderer.invoke('pdf:generateBook', bookId),
  },

  // Settings operations
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
    reinitializeAI: () => ipcRenderer.invoke('settings:reinitializeAI'),
  },

  // Backup operations
  backup: {
    export: () => ipcRenderer.invoke('backup:export'),
    import: () => ipcRenderer.invoke('backup:import'),
  },
});

console.log('✅ Preload script loaded - electronAPI is available');

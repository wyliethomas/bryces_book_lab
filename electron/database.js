import Database from 'better-sqlite3';
import crypto from 'crypto';

class BookDatabase {
  constructor(dbPath) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initializeTables();
  }

  initializeTables() {
    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notes_topics (
        note_id INTEGER,
        topic_id INTEGER,
        PRIMARY KEY (note_id, topic_id),
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        author VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        chapter_number INTEGER NOT NULL,
        outline TEXT,
        content TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT
      );
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
      CREATE INDEX IF NOT EXISTS idx_notes_topics_note_id ON notes_topics(note_id);
      CREATE INDEX IF NOT EXISTS idx_notes_topics_topic_id ON notes_topics(topic_id);
    `);
  }

  // Books operations
  getAllBooks() {
    const stmt = this.db.prepare(`
      SELECT b.*,
        COUNT(DISTINCT c.id) as chapter_count,
        COALESCE(SUM(LENGTH(c.content) - LENGTH(REPLACE(c.content, ' ', '')) + 1), 0) as word_count
      FROM books b
      LEFT JOIN chapters c ON b.id = c.book_id
      GROUP BY b.id
      ORDER BY b.updated_at DESC
    `);
    return stmt.all();
  }

  getBookById(id) {
    const stmt = this.db.prepare(`
      SELECT b.*,
        COUNT(DISTINCT c.id) as chapter_count,
        COALESCE(SUM(LENGTH(c.content) - LENGTH(REPLACE(c.content, ' ', '')) + 1), 0) as word_count
      FROM books b
      LEFT JOIN chapters c ON b.id = c.book_id
      WHERE b.id = ?
      GROUP BY b.id
    `);
    return stmt.get(id);
  }

  createBook(book) {
    const stmt = this.db.prepare(`
      INSERT INTO books (title, description, author)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(book.title, book.description || null, book.author || null);
    return this.getBookById(result.lastInsertRowid);
  }

  updateBook(id, book) {
    const stmt = this.db.prepare(`
      UPDATE books
      SET title = ?, description = ?, author = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(book.title, book.description || null, book.author || null, id);
    return this.getBookById(id);
  }

  deleteBook(id) {
    const stmt = this.db.prepare('DELETE FROM books WHERE id = ?');
    stmt.run(id);
    return { success: true };
  }

  // Chapters operations
  getChaptersByBookId(bookId) {
    const stmt = this.db.prepare(`
      SELECT * FROM chapters
      WHERE book_id = ?
      ORDER BY chapter_number ASC
    `);
    return stmt.all(bookId);
  }

  getChapterById(id) {
    const stmt = this.db.prepare('SELECT * FROM chapters WHERE id = ?');
    return stmt.get(id);
  }

  createChapter(chapter) {
    // Get the next chapter number
    const countStmt = this.db.prepare(`
      SELECT COALESCE(MAX(chapter_number), 0) + 1 as next_number
      FROM chapters
      WHERE book_id = ?
    `);
    const { next_number } = countStmt.get(chapter.book_id);

    const stmt = this.db.prepare(`
      INSERT INTO chapters (book_id, title, chapter_number, outline, content, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      chapter.book_id,
      chapter.title,
      next_number,
      chapter.outline || null,
      chapter.content || null,
      chapter.status || 'draft'
    );

    // Update book's updated_at
    this.db.prepare('UPDATE books SET updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(chapter.book_id);

    return this.getChapterById(result.lastInsertRowid);
  }

  updateChapter(id, chapter) {
    const current = this.getChapterById(id);
    if (!current) return null;

    const stmt = this.db.prepare(`
      UPDATE chapters
      SET title = ?, outline = ?, content = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      chapter.title !== undefined ? chapter.title : current.title,
      chapter.outline !== undefined ? chapter.outline : current.outline,
      chapter.content !== undefined ? chapter.content : current.content,
      chapter.status !== undefined ? chapter.status : current.status,
      id
    );

    // Update book's updated_at
    this.db.prepare('UPDATE books SET updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(current.book_id);

    return this.getChapterById(id);
  }

  deleteChapter(id) {
    const chapter = this.getChapterById(id);
    if (!chapter) return { success: false };

    const stmt = this.db.prepare('DELETE FROM chapters WHERE id = ?');
    stmt.run(id);

    // Reorder remaining chapters
    const updateStmt = this.db.prepare(`
      UPDATE chapters
      SET chapter_number = chapter_number - 1
      WHERE book_id = ? AND chapter_number > ?
    `);
    updateStmt.run(chapter.book_id, chapter.chapter_number);

    // Update book's updated_at
    this.db.prepare('UPDATE books SET updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(chapter.book_id);

    return { success: true };
  }

  reorderChapters(bookId, chapterIds) {
    const updateStmt = this.db.prepare(`
      UPDATE chapters SET chapter_number = ? WHERE id = ?
    `);

    const transaction = this.db.transaction((ids) => {
      ids.forEach((id, index) => {
        updateStmt.run(index + 1, id);
      });
    });

    transaction(chapterIds);

    // Update book's updated_at
    this.db.prepare('UPDATE books SET updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(bookId);

    return this.getChaptersByBookId(bookId);
  }

  // Notes operations
  getAllNotes() {
    const stmt = this.db.prepare(`
      SELECT n.*, GROUP_CONCAT(t.name) as topics
      FROM notes n
      LEFT JOIN notes_topics nt ON n.id = nt.note_id
      LEFT JOIN topics t ON nt.topic_id = t.id
      GROUP BY n.id
      ORDER BY n.created_at DESC
    `);
    return stmt.all();
  }

  createNote(note) {
    const stmt = this.db.prepare(`
      INSERT INTO notes (content) VALUES (?)
    `);
    const result = stmt.run(note.content);
    return { id: result.lastInsertRowid, ...note };
  }

  linkNoteToTopic(noteId, topicId) {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO notes_topics (note_id, topic_id) VALUES (?, ?)
    `);
    stmt.run(noteId, topicId);
  }

  deleteNote(id) {
    const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?');
    stmt.run(id);
    return { success: true };
  }

  getNoteById(id) {
    const stmt = this.db.prepare(`
      SELECT n.*,
        GROUP_CONCAT(t.name) as topics,
        GROUP_CONCAT(t.id) as topic_ids
      FROM notes n
      LEFT JOIN notes_topics nt ON n.id = nt.note_id
      LEFT JOIN topics t ON nt.topic_id = t.id
      WHERE n.id = ?
      GROUP BY n.id
    `);
    return stmt.get(id);
  }

  getNotesById(noteIds) {
    if (!noteIds || noteIds.length === 0) {
      return [];
    }
    const placeholders = noteIds.map(() => '?').join(',');
    const stmt = this.db.prepare(`
      SELECT n.*, GROUP_CONCAT(t.name) as topics
      FROM notes n
      LEFT JOIN notes_topics nt ON n.id = nt.note_id
      LEFT JOIN topics t ON nt.topic_id = t.id
      WHERE n.id IN (${placeholders})
      GROUP BY n.id
      ORDER BY n.created_at DESC
    `);
    return stmt.all(...noteIds);
  }

  updateNote(id, content) {
    const stmt = this.db.prepare(`
      UPDATE notes SET content = ? WHERE id = ?
    `);
    stmt.run(content, id);
    return this.getNoteById(id);
  }

  unlinkNoteFromTopic(noteId, topicId) {
    const stmt = this.db.prepare(`
      DELETE FROM notes_topics WHERE note_id = ? AND topic_id = ?
    `);
    stmt.run(noteId, topicId);
  }

  // Topics operations
  getAllTopics() {
    const stmt = this.db.prepare(`
      SELECT t.*, COUNT(nt.note_id) as note_count
      FROM topics t
      LEFT JOIN notes_topics nt ON t.id = nt.topic_id
      GROUP BY t.id
      ORDER BY t.name ASC
    `);
    return stmt.all();
  }

  getTopicById(id) {
    const stmt = this.db.prepare('SELECT * FROM topics WHERE id = ?');
    return stmt.get(id);
  }

  getTopicByName(name) {
    const stmt = this.db.prepare('SELECT * FROM topics WHERE name = ?');
    return stmt.get(name);
  }

  createTopic(name) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO topics (name) VALUES (?)
      `);
      const result = stmt.run(name);
      return { id: result.lastInsertRowid, name };
    } catch (error) {
      // If topic already exists, return existing one
      if (error.code && error.code.startsWith('SQLITE_CONSTRAINT')) {
        return this.getTopicByName(name);
      }
      throw error;
    }
  }

  getNotesByTopicId(topicId) {
    const stmt = this.db.prepare(`
      SELECT n.* FROM notes n
      INNER JOIN notes_topics nt ON n.id = nt.note_id
      WHERE nt.topic_id = ?
      ORDER BY n.created_at DESC
    `);
    return stmt.all(topicId);
  }

  // Settings operations
  getSetting(key) {
    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
    const result = stmt.get(key);
    return result ? result.value : null;
  }

  setSetting(key, value) {
    // Encrypt API key if that's what we're setting
    let finalValue = value;
    if (key === 'openai_api_key' && value) {
      finalValue = this.encrypt(value);
    }

    const stmt = this.db.prepare(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    stmt.run(key, finalValue);
    return { success: true };
  }

  // Simple encryption for API keys (in production, use better encryption)
  encrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync('book-writing-assistant-secret', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync('book-writing-assistant-secret', 'salt', 32);
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  getDecryptedSetting(key) {
    const value = this.getSetting(key);
    if (!value) return null;
    if (key === 'openai_api_key') {
      return this.decrypt(value);
    }
    return value;
  }

  close() {
    this.db.close();
  }
}

export default BookDatabase;

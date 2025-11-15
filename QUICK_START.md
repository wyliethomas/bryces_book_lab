# Quick Start Guide

## Your Book Writing Assistant is Ready!

### 🎉 What You Just Built

A complete desktop application for writing books with AI assistance, featuring:
- **Electron + React + Vite** stack
- **SQLite** database for local storage
- **OpenAI GPT-4** integration for AI features
- **TipTap** rich text editor
- **Professional PDF generation**
- **Three-panel Slack-style interface**

### 📁 Project Location

Your project is located at:
```
/home/battlestag/Work/_CLIENTS/BRYCE/app/book-writing-assistant/
```

### 🚀 Running the Application

#### Development Mode (with hot-reload):

```bash
cd /home/battlestag/Work/_CLIENTS/BRYCE/app/book-writing-assistant
npm run electron:dev
```

This will:
1. Start the Vite development server (http://localhost:5173)
2. Launch Electron with the app
3. Enable hot-reload for development

#### Production Build:

```bash
npm run electron:build
```

This creates a distributable package in the `dist-electron` folder.

### 🔑 First-Time Setup

1. **Launch the application** using the command above

2. **Configure OpenAI API Key**:
   - Click "Settings" in the bottom left sidebar
   - Enter your OpenAI API key (get one from https://platform.openai.com/api-keys)
   - Enter your author name
   - Click "Save Settings"

3. **You're ready to start writing!**

### 📖 Basic Workflow

#### 1. Create a Book
- Click the "+" button next to "Books" in the left sidebar
- Fill in title, author, and description
- Click "Create"

#### 2. Add Research Notes
- Click "All Notes" in the left sidebar
- Paste your research notes (separate different ideas with blank lines)
- Click "Process Notes"
- AI will automatically extract topics and organize your notes

#### 3. Create a Chapter
- Select your book from the left sidebar
- Click "+ New Chapter" in the right sidebar
- Enter chapter title
- Optionally select a topic to auto-generate an outline
- Click "Create Chapter"

#### 4. Write with AI
- **Outline Tab**: Review/edit the AI-generated outline, or write your own
- **Content Tab**: Click "Generate Chapter Content" to create the full chapter
- **AI Assistant Tab**: Chat with AI for writing help and suggestions

#### 5. Export to PDF
- Click "Generate PDF" in the right sidebar
- Wait for generation
- Click "Open PDF" to view
- PDF saved to your Downloads folder

### 📂 Project Structure

```
book-writing-assistant/
├── electron/              # Electron backend
│   ├── main.js           # Main process
│   ├── preload.js        # IPC bridge
│   ├── database.js       # SQLite operations
│   ├── ai-service.js     # OpenAI integration
│   └── pdf-generator.js  # PDF creation
├── src/                   # React frontend
│   ├── components/       # UI components
│   │   ├── Layout/       # Three-panel layout
│   │   ├── Editor/       # Chapter editors
│   │   ├── Books/        # Book management
│   │   ├── Chapters/     # Chapter management
│   │   ├── Notes/        # Notes processing
│   │   ├── Topics/       # Topics catalog
│   │   └── Settings/     # Settings page
│   ├── contexts/         # React Context (state)
│   └── styles/           # TailwindCSS styles
├── index.html            # Entry HTML
├── package.json          # Dependencies
└── README.md             # Full documentation
```

### 🎨 Key Features to Try

1. **AI Topic Extraction**
   - Upload raw notes and let AI identify topics automatically

2. **Outline Generation**
   - Create chapters linked to topics for auto-generated outlines

3. **Full Chapter Writing**
   - Generate 2000-3000 word chapters from outlines

4. **Content Refinement**
   - Select any text and ask AI to improve it

5. **Interactive AI Assistant**
   - Chat interface for writing help and suggestions

6. **Professional PDFs**
   - Export complete books with cover page and table of contents

### 🛠️ Customization

#### Update Dependencies
```bash
npm update
```

#### Add New Features
- Edit components in `src/components/`
- Modify database schema in `electron/database.js`
- Add AI features in `electron/ai-service.js`

#### Styling
- Update TailwindCSS classes in components
- Modify `src/styles/index.css` for custom styles

### 📊 Database Location

The SQLite database is stored at:
- **Linux**: `~/.config/Book Writing Assistant/books.db`
- **macOS**: `~/Library/Application Support/Book Writing Assistant/books.db`
- **Windows**: `%APPDATA%/Book Writing Assistant/books.db`

### 🐛 Troubleshooting

#### Electron won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### API Key issues
1. Go to Settings
2. Re-enter your OpenAI API key
3. Verify you have credits at https://platform.openai.com/usage

#### Build errors
```bash
# Update Node.js to 18+ if needed
node --version  # Should be 18.0.0 or higher

# Rebuild native modules
npm rebuild better-sqlite3
```

### 💡 Tips

1. **Auto-save**: The editor auto-saves every 2 seconds
2. **Word Count**: Displayed in the chapter editor header
3. **Status Tracking**: Chapters show status (draft/outline/complete)
4. **Keyboard Shortcuts**:
   - Cmd/Ctrl + B = Bold
   - Cmd/Ctrl + I = Italic
   - Cmd/Ctrl + U = Underline

### 📈 Cost Estimates (OpenAI Usage)

- **Topic Extraction**: ~$0.01 per 10 paragraphs
- **Outline Generation**: ~$0.05 per outline
- **Chapter Generation**: ~$0.20-0.50 per chapter
- **Content Refinement**: ~$0.02-0.10 per request

Monitor your usage at: https://platform.openai.com/usage

### 📚 Next Steps

1. **Read the full README.md** for detailed documentation
2. **Explore the interface** - click around and try features
3. **Start with a small test book** to understand the workflow
4. **Check out the code** to customize features
5. **Build your masterpiece!** 📖✨

### 🆘 Getting Help

- Check `README.md` for comprehensive documentation
- Review console logs for error messages
- Ensure OpenAI API key is valid and has credits
- Check that all dependencies installed successfully

### 🎯 What's Next?

The application is fully functional and ready to use. Future enhancements you might want to add:

- [ ] Export to DOCX/EPUB
- [ ] Dark mode
- [ ] Version history
- [ ] Grammar checking
- [ ] Cloud sync
- [ ] Collaboration features

---

**You're all set! Happy writing!** 🎉✍️

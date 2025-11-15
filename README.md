# Book Writing Assistant

A powerful desktop application that helps you write books with AI assistance. Built with Electron, React, and OpenAI's GPT-4.

![Book Writing Assistant](https://via.placeholder.com/800x400?text=Book+Writing+Assistant)

## Features

### 📚 Book Management
- Create and organize multiple books
- Track progress with chapter and word counts
- Edit book metadata (title, author, description)

### ✍️ AI-Powered Writing
- **Topic Extraction**: Upload notes and automatically extract topics using AI
- **Outline Generation**: Generate detailed chapter outlines from your notes
- **Content Generation**: Create full chapter content based on outlines
- **Content Refinement**: Improve selected text with AI assistance
- **Interactive AI Assistant**: Chat with AI about your writing

### 📝 Rich Text Editor
- Professional TipTap editor with formatting options
- Bold, italic, underline, lists, and more
- Auto-save functionality (saves every 2 seconds)
- Word count tracking

### 📄 PDF Export
- Generate professional PDFs of your books
- Includes cover page, table of contents, and formatted chapters
- Beautiful typography optimized for reading

### 🏷️ Notes Organization
- Upload and organize research notes
- Automatic topic extraction and categorization
- Filter notes by topic
- Link notes to chapters

### 🎨 Modern UI
- Slack-style three-panel interface
- Clean, professional design
- Intuitive navigation
- Real-time status updates

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher
- **OpenAI API Key**: Get one from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Operating System**: macOS, Windows, or Linux

## Installation

### 1. Clone or Extract the Project

```bash
cd book-writing-assistant
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Electron for desktop app functionality
- React for the UI
- TipTap for rich text editing
- better-sqlite3 for local database
- OpenAI SDK for AI features
- Puppeteer for PDF generation

### 3. Set Up Your OpenAI API Key

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Launch the application
3. Go to Settings (bottom of left sidebar)
4. Enter your API key
5. Click "Save Settings"

Your API key is encrypted and stored securely on your local machine.

## Development

### Run in Development Mode

```bash
npm run electron:dev
```

This will:
1. Start the Vite development server
2. Launch Electron with hot-reload enabled
3. Open DevTools for debugging

### Build for Production

```bash
npm run electron:build
```

This will create a distributable package in the `dist-electron` directory.

For macOS, you'll get:
- `.dmg` file for easy installation
- `.zip` file for manual installation

## Usage Guide

### Creating Your First Book

1. Click the "+" button next to "Books" in the left sidebar
2. Enter book title, author name, and description
3. Click "Create"

### Adding Notes

1. Navigate to "All Notes" in the left sidebar
2. Paste or type your research notes (separate ideas with blank lines)
3. Click "Process Notes"
4. AI will automatically extract topics and organize your notes

### Creating a Chapter

1. Select a book from the left sidebar
2. Click "+ New Chapter" in the right sidebar
3. Enter chapter title
4. Optionally select a topic to auto-generate an outline
5. Click "Create Chapter"

### Writing with AI Assistance

#### Step 1: Create/Refine Outline
1. Open a chapter
2. Go to the "Outline" tab
3. Edit the outline or click "Refine with AI" for improvements
4. Click "Approve Outline" when ready

#### Step 2: Generate Content
1. Go to the "Content" tab
2. Click "Generate Chapter Content"
3. AI will write the full chapter based on your outline and notes
4. Edit as needed using the rich text editor

#### Step 3: Refine Your Writing
1. Select any text in the editor
2. Click "Refine Selection"
3. Tell AI how to improve it
4. Review and accept changes

### Using the AI Assistant

1. Go to the "AI Assistant" tab
2. Ask questions or request help
3. Get suggestions for improvements
4. Iterate on your writing

### Exporting to PDF

1. Select a book with chapters
2. Click "Generate PDF" in the right sidebar
3. Wait for PDF generation
4. Click "Open PDF" to view
5. PDF is saved to your Downloads folder

## Project Structure

```
book-writing-assistant/
├── electron/
│   ├── main.js              # Electron main process
│   ├── preload.js           # IPC bridge (security)
│   ├── database.js          # SQLite operations
│   ├── ai-service.js        # OpenAI API integration
│   └── pdf-generator.js     # PDF creation
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Main app component
│   ├── components/
│   │   ├── Layout/          # Three-panel layout
│   │   ├── Editor/          # Chapter editors
│   │   ├── Books/           # Book management
│   │   ├── Chapters/        # Chapter management
│   │   ├── Notes/           # Notes processing
│   │   ├── Topics/          # Topics catalog
│   │   └── Settings/        # Settings page
│   ├── contexts/
│   │   └── AppContext.jsx   # Global state
│   └── styles/
│       └── index.css        # TailwindCSS styles
├── package.json
├── vite.config.js
└── README.md
```

## Database

The application uses SQLite to store all data locally on your machine. The database file is stored in:

- **macOS**: `~/Library/Application Support/Book Writing Assistant/books.db`
- **Windows**: `%APPDATA%/Book Writing Assistant/books.db`
- **Linux**: `~/.config/Book Writing Assistant/books.db`

### Tables

- **books**: Book metadata
- **chapters**: Chapter content and outlines
- **notes**: Research notes
- **topics**: Extracted topics
- **notes_topics**: Links between notes and topics
- **settings**: Application settings (encrypted)

## Troubleshooting

### API Key Not Working

1. Make sure you've entered a valid OpenAI API key
2. Check that you have credits in your OpenAI account
3. Go to Settings and re-enter your API key
4. Restart the application

### PDF Generation Fails

1. Ensure you have chapters with content
2. Check that Puppeteer is installed correctly
3. Try running `npm install puppeteer` manually
4. On some systems, you may need to install Chrome/Chromium

### Database Errors

1. Close the application completely
2. Navigate to the database location (see above)
3. Backup the `books.db` file
4. Delete `books.db` and restart (this will reset all data)

### Build Errors

1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again
4. Try building again

### Electron Won't Start

1. Make sure you're using Node.js 18 or higher
2. Check that all dependencies installed correctly
3. Try `npm run dev` first to test Vite
4. Check console for error messages

## Security

- **API Keys**: Encrypted using AES-256-CBC before storage
- **Context Isolation**: Enabled in Electron for security
- **No Remote Access**: All data stays on your local machine
- **Secure IPC**: Uses Electron's contextBridge for safe communication

## Performance Tips

- The application auto-saves every 2 seconds
- Large documents may take longer to process
- PDF generation can take 10-30 seconds depending on book length
- AI requests typically take 5-15 seconds

## AI Usage & Costs

This application uses OpenAI's GPT-4 API. Costs depend on your usage:

- **Topic Extraction**: ~$0.01 per 10 paragraphs
- **Outline Generation**: ~$0.05 per outline
- **Chapter Generation**: ~$0.20-0.50 per chapter (2000-3000 words)
- **Content Refinement**: ~$0.02-0.10 per request

Monitor your usage at [OpenAI Platform](https://platform.openai.com/usage).

## Keyboard Shortcuts

- **Cmd/Ctrl + B**: Bold
- **Cmd/Ctrl + I**: Italic
- **Cmd/Ctrl + U**: Underline
- **Cmd/Ctrl + S**: Manual save (auto-save is enabled)
- **Enter**: Send message in AI Assistant
- **Shift + Enter**: New line in AI Assistant

## Future Enhancements

Planned features for future releases:

- [ ] Export to DOCX, Markdown, ePub
- [ ] Version history for chapters
- [ ] Global search across all content
- [ ] Dark mode
- [ ] Custom PDF templates
- [ ] Cloud sync (optional)
- [ ] Collaboration features
- [ ] Grammar and style checking
- [ ] Word count goals and progress tracking
- [ ] Chapter templates

## Support

For issues, questions, or feature requests:

1. Check this README for troubleshooting tips
2. Review the console logs for error messages
3. Make sure you're using the latest version
4. Ensure your OpenAI API key is valid and has credits

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [React](https://react.dev/)
- Rich text editing with [TipTap](https://tiptap.dev/)
- AI powered by [OpenAI](https://openai.com/)
- Styling with [TailwindCSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Happy Writing!** 📚✍️

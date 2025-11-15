# Troubleshooting Guide

## Common Issues and Solutions

### ✅ FIXED: 404 Error - Cannot find dist/index.html

**Symptom**: When running `npm run electron:dev`, you get an error "Failed to load resource" or "Cannot find dist/index.html"

**Root Cause**: The `NODE_ENV` environment variable wasn't being set, causing Electron to run in production mode instead of development mode.

**Solution Applied**:
1. Installed `cross-env` package for cross-platform environment variable support
2. Updated `electron:dev` script to set `NODE_ENV=development`
3. Improved `electron/main.js` with better environment detection and error messages

**How to Test**:
```bash
npm run electron:dev
```

You should now see:
- ✅ Vite dev server starts on http://localhost:5173
- ✅ Electron window opens after Vite is ready
- ✅ Developer tools open automatically
- ✅ Application loads successfully

---

## Development vs Production Modes

### Development Mode (`npm run electron:dev`)
- Loads from Vite dev server (http://localhost:5173)
- Hot-reload enabled (changes appear instantly)
- DevTools open automatically
- Better error messages in console

### Production Mode (`npm run electron:build`)
- Builds React app to `dist/` folder
- Loads from local `dist/index.html` file
- Creates distributable package
- Optimized and minified

---

## Other Common Issues

### Issue: Electron window opens but shows blank white screen

**Possible Causes**:
1. Vite dev server not running
2. Port 5173 already in use
3. React compilation errors

**Solution**:
```bash
# 1. Stop any running processes (Ctrl+C)
# 2. Clear any processes using port 5173
lsof -ti:5173 | xargs kill -9

# 3. Start fresh
npm run electron:dev
```

Check the terminal output for any React/Vite compilation errors.

---

### Issue: "Cannot find module" errors

**Possible Causes**:
- Missing dependencies
- Corrupted node_modules

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

### Issue: SQLite compilation errors

**Symptom**: Errors during `npm install` mentioning `better-sqlite3` or `node-gyp`

**Possible Causes**:
- Incompatible Node.js version
- Missing build tools

**Solution**:
```bash
# Check Node.js version (should be 18+)
node --version

# If < 18, update Node.js first

# Rebuild better-sqlite3
npm rebuild better-sqlite3
```

---

### Issue: OpenAI API errors

**Symptoms**:
- "API key not configured" error
- "Failed to extract topics" error
- "Insufficient credits" error

**Solution**:
1. Go to Settings in the app
2. Enter your OpenAI API key
3. Click "Save Settings"
4. Verify you have credits at https://platform.openai.com/usage

**Testing API Connection**:
- Try adding a simple note in "All Notes"
- Click "Process Notes"
- If successful, topics will be extracted

---

### Issue: PDF generation fails

**Possible Causes**:
- Puppeteer not installed correctly
- Missing Chrome/Chromium

**Solution**:
```bash
# Reinstall Puppeteer
npm install puppeteer

# Or use system Chrome
npm install puppeteer-core
```

---

### Issue: Hot-reload not working

**Symptom**: Changes to React components don't appear in the app

**Solution**:
1. Make sure you're running `npm run electron:dev` (not `electron .`)
2. Check that Vite is showing "[vite] hmr update" messages
3. Try hard refresh: Cmd+R (Mac) or Ctrl+R (Windows/Linux)

---

## Debug Mode

### Enable Verbose Logging

Add this to `electron/main.js` after line 9:
```javascript
process.env.DEBUG = 'electron*';
```

### View Console Logs

**In Electron**:
- DevTools console (opens automatically in dev mode)
- View → Toggle Developer Tools

**In Terminal**:
- Check terminal where you ran `npm run electron:dev`
- All console.log statements appear here

---

## Environment Variables

### Current Setup

**Development** (`npm run electron:dev`):
- `NODE_ENV=development` ✅
- Loads from: `http://localhost:5173`
- DevTools: Enabled

**Production** (`npm run electron:build`):
- `NODE_ENV=production` (default)
- Loads from: `dist/index.html`
- DevTools: Disabled

### Manual Override

```bash
# Force development mode
cross-env NODE_ENV=development electron .

# Force production mode
cross-env NODE_ENV=production electron .
```

---

## Port Conflicts

### If Vite can't start on 5173

**Update vite.config.js**:
```javascript
server: {
  port: 5174,  // Change to different port
  strictPort: true,
},
```

**Update electron/main.js** (line 36):
```javascript
mainWindow.loadURL('http://localhost:5174');
```

**Update package.json** (line 11):
```json
"electron:dev": "concurrently \"vite\" \"wait-on http://localhost:5174 && cross-env NODE_ENV=development electron .\""
```

---

## Fresh Start Checklist

If everything is broken, start from scratch:

```bash
# 1. Stop all processes
# Press Ctrl+C multiple times

# 2. Clean everything
rm -rf node_modules package-lock.json dist

# 3. Reinstall
npm install

# 4. Test Vite alone first
npm run dev
# Should see: "Local: http://localhost:5173"
# Open in browser to verify React app works

# 5. Stop Vite (Ctrl+C)

# 6. Run full app
npm run electron:dev
```

---

## Getting More Help

### Check Logs

1. **Terminal output** - where you ran npm run electron:dev
2. **DevTools console** - in the Electron window (F12)
3. **Network tab** - shows failed resource loads

### Debug Checklist

- [ ] Node.js version 18+ installed (`node --version`)
- [ ] All dependencies installed (`npm install` succeeded)
- [ ] No errors in terminal when running `npm run dev`
- [ ] Vite shows "ready in X ms" message
- [ ] Port 5173 is available
- [ ] OpenAI API key is set (for AI features)

### Report an Issue

If still having problems, provide:
1. Node.js version: `node --version`
2. OS: macOS/Windows/Linux
3. Full terminal output
4. Screenshot of error
5. Steps to reproduce

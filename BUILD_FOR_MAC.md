# Building Bryce's Book Lab for macOS

## Prerequisites on MacBook

1. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/
   - Or use Homebrew: `brew install node`

2. **Install Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

## Build Steps

1. **Transfer the project folder** to your MacBook

2. **Open Terminal** and navigate to the project folder:
   ```bash
   cd path/to/book-writing-assistant
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Build the DMG**:
   ```bash
   npm run electron:build
   ```

5. **Find your installer**:
   The DMG will be created in the `dist-electron` folder:
   - `dist-electron/Bryce's Book Lab-1.0.0.dmg` ← This is the installer!

## Deliver to Bryce

Send Bryce the DMG file. He can:
1. Double-click the DMG to mount it
2. Drag "Bryce's Book Lab" to his Applications folder
3. Launch it from Applications

## Notes

- The first time Bryce opens the app, macOS may show a security warning
- Tell him to: **Right-click → Open** (or go to System Preferences → Security & Privacy and click "Open Anyway")
- After the first launch, he can open it normally

## Build Time

The build process takes about 2-5 minutes depending on your Mac's speed.

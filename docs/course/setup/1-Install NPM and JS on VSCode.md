### 1. Install Node.js and npm

Node.js is required for both plugins to run JavaScript code.

#### macOS (via Homebrew) Make sure you have Brew Installed

0. Prereqs, make sure you have hombrew installed

```
brew -v
```

If its working it should display "Homebrew v.v.v" where v is numbers for the version

If not found you need to install homebrew, otherwise go to the next section "macOS (via Homebrew) Install Node JS"

Note: This [video](https://www.youtube.com/watch?v=B4qsvQ5IqWk) may be useful.

1. Open a terminal (cmd+space > Type "terminal") and hit enter
2. Run the following command by copying and pasting the text and hitting enter

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

- Enter password when asked
- Hit enter when it prompts about XCode

3.  run each echo command one by one listed in the next steps section

- Don't copy these lines, copy your versions one by one and run them by pressing enter after pasting in the terminal
  echo >>... .zprofile
  echo 'eval"$ ... .zprofile
  echo eval ....
  4.. Then run the following command in the terminal

#### macOS (via Homebrew) Install Node JS

1. Open Terminal
2. Run:

```bash
brew install node
```

3. Confirm installation:

```bash
node -v
npm -v
```

#### Windows

1. Visit [https://nodejs.org](https://nodejs.org/)
2. Select the LTS (LTS version) at the top
3. Go half way down the page where it says "Or get a prebuilt Node.js® for" and select Windows AND x64
4. Run the installer (make sure the box to install npm is checked)
5. Open powershell and confirm:

```cmd
node -v
npm -v
```

Note: If you run into an error you may need to open an administrator powershell and run the following:

```
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### 2. Optional - Install one of these VSCode Plugins

#### Quokka.js (Live JavaScript Coding)

- Plugin ID: `WallabyJs.quokka-vscode`

**Steps:**

1. Open VSCode
2. Go to the Extensions panel (`Cmd+Shift+X` or `Ctrl+Shift+X`)
3. Search: `WallabyJs.quokka-vscode
4. Click **Install**
5. To start Quokka in a file:
   - Open a JavaScript file
   - Press `Cmd/Ctrl + Shift + P`, then select one of the following:
     - **Quokka.js: Start on Current File**
     - **Quokka.js: New File**

#### JavaScript REPL

- Plugin ID: `achil.vscode-javascript-repl`

**Steps:**

1. Open VSCode
2. Go to the Extensions panel
3. Search: `achil.vscode-javascript-repl`
4. Click **Install**
5. To launch REPL:
   - Press `Cmd/Ctrl + Shift + P` , then select one of the following:
     - **JS Repl: Run** (to start on current file)
     - **JS Repl: New JavaScript File (.js)**

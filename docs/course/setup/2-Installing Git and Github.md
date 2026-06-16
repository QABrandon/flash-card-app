## Optional - Installing Github Desktop

1. Install Github Desktop (Windows or Mac)
   1. https://desktop.github.com/download/
2. Sign up for Github.com

## Install GIt

### Windows

1. https://git-scm.com/downloads/win
2. Install
3. Use main for the branch
4. Path - Use "Recommended"
5. Use vscode for comparisons/diff
6. Open Terminal or Powershell
7. Type git -v and you should see the git version you installed
8. Something like "git version 2.39.5"

### Mac

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

```
brew install git
```

5. Type "git -v" in the terminal
6. You will see something like "git version 2.39.5 (Apple Git-154)"

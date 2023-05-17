@echo off

REM Set your GitHub username and repository URL
set USERNAME=0xhylia
set REPO_URL=https://github.com/LabsStar/nanoha-bot.git

REM Set the branch you want to push to
set BRANCH=docs

REM Set the commit message
set COMMIT_MESSAGE=Update documentation

REM Change to the local repository directory
cd "."

REM Add all changes to the Git index
git add .

REM Commit the changes with the specified message
git commit -m "%COMMIT_MESSAGE%"

REM Push the changes to the remote repository and specified branch
git push %USERNAME%@%REPO_URL% HEAD:%BRANCH%

REM Pause the script to see the output (optional)
pause

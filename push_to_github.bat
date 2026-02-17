@echo off
echo ==========================================
echo      Pushing SmartCare App to GitHub
echo ==========================================
echo.

echo 1. Initializing Git Repository...
git init

echo.
echo 2. Staging Files...
git add .

echo.
echo 3. Committing Files...
git commit -m "Initial commit of SmartCare HQMS"

echo.
echo 4. Setting Branch to Main...
git branch -M main

echo.
echo 5. Connecting to GitHub Remote...
git remote add origin https://github.com/Mohammed-Ashraf-Shaik/smart-care-app.git

echo.
echo 6. Pushing to GitHub (A login window may appear)...
git push -u origin main

echo.
echo ==========================================
echo                 DONE!
echo ==========================================
pause

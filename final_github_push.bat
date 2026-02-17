@echo off
echo ==========================================
echo      FINAL FAILSAFE GITHUB PUSH
echo ==========================================

echo.
set /p gh_user="Enter your ACTUAL GitHub Username: "
echo.

echo 1. Clearing previous settings...
git remote remove origin 2>nul

echo.
echo 2. Initializing & Staging...
git init
git add .
git commit -m "Complete project upload" 2>nul

echo.
echo 3. Connecting to: https://github.com/%gh_user%/smart-care-app.git
git remote add origin https://github.com/%gh_user%/smart-care-app.git
git branch -M main

echo.
echo 4. Pushing to GitHub...
echo (If a browser window opens, please log in)
git push -u origin main

echo.
echo ==========================================
echo    If it still says "Not Found", please 
echo    double check your repository name!
echo ==========================================
pause

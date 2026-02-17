@echo off
echo ==========================================
echo      Configuring Git & Pushing Project
echo ==========================================

echo.
echo Git needs to know who you are before committing code.
echo Please enter your details below.
echo.

set /p user_email="Enter your Email: "
set /p user_name="Enter your Name: "

echo.
echo 1. Configuring Git...
git config --global user.email "%user_email%"
git config --global user.name "%user_name%"

echo.
echo 2. Initializing Git Repository...
git init

echo.
echo 3. Staging Files...
git add .

echo.
echo 4. Committing Files...
git commit -m "Initial commit of SmartCare HQMS"

echo.
echo 5. Setting Branch to Main...
git branch -M main

echo.
echo 6. Connecting to GitHub Remote...
git remote remove origin 2>nul
git remote add origin https://github.com/Mohammed-Ashraf-Shaik/smart-care-app.git

echo.
echo 7. Pushing to GitHub...
git push -u origin main

echo.
echo ==========================================
echo                 DONE!
echo ==========================================
pause

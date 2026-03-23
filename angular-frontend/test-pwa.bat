@echo off
echo Building production PWA...
call npx @angular/cli@18.2.21 build
echo.
echo Starting local web server on port 8080...
echo Please open http://127.0.0.1:8080 in your browser.
call npx http-server -p 8080 -c-1 dist/angular-frontend/browser
pause

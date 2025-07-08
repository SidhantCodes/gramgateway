@echo off
echo Setting up GramGateway Next.js Frontend...
echo.

cd frontend-nextjs

echo Installing dependencies...
npm install

echo.
echo Setup complete! 

echo.
echo To start the development server:
echo   cd frontend-nextjs
echo   npm run dev

echo.
echo The frontend will be available at: http://localhost:3000
echo Make sure your backend server is running at: http://localhost:8000

pause

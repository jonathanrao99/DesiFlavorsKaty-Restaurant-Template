@echo off
REM Desi Flavors Hub Order Service Startup Script for Windows

echo 🚀 Starting Desi Flavors Hub Order Service...

REM Set Python path
set PYTHON_PATH=C:\Users\jonat\AppData\Local\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0\python.exe

REM Check if Python is installed
"%PYTHON_PATH%" --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not found at expected location.
    pause
    exit /b 1
)

REM Check if pip is installed
"%PYTHON_PATH%" -m pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip is not installed. Please install pip.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Creating template...
    (
        echo # Shipday Configuration
        echo SHIPDAY_API_KEY=your_shipday_api_key_here
        echo STORE_ADDRESS=1989 North Fry Rd, Katy, TX 77494
        echo STORE_PHONE_NUMBER=+12814010758
        echo.
        echo # Order Service Configuration
        echo ORDER_SERVICE_HOST=0.0.0.0
        echo ORDER_SERVICE_PORT=8000
        echo ORDER_SERVICE_RELOAD=true
        echo.
        echo # Supabase Configuration (if needed)
        echo NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
    ) > .env
    echo 📝 Please edit .env file with your actual API keys and configuration.
    echo    Then run this script again.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing Python dependencies...
"%PYTHON_PATH%" -m pip install -r requirements.txt

if errorlevel 1 (
    echo ❌ Failed to install dependencies. Please check your Python environment.
    pause
    exit /b 1
)

REM Check if SHIPDAY_API_KEY is set
findstr /C:"your_shipday_api_key_here" .env >nul
if not errorlevel 1 (
    echo ⚠️  Please update your SHIPDAY_API_KEY in the .env file before running the service.
    pause
    exit /b 1
)

REM Start the service
echo 🌟 Starting the order service...
echo 📍 Service will be available at: http://localhost:8000
echo 📚 API documentation: http://localhost:8000/docs
echo 🔍 Health check: http://localhost:8000/health
echo.
echo Press Ctrl+C to stop the service
echo.

REM Run the service
"%PYTHON_PATH%" -m order_service.main

pause 
#!/bin/bash

# Desi Flavors Hub Order Service Startup Script

echo "🚀 Starting Desi Flavors Hub Order Service..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << EOF
# Shipday Configuration
SHIPDAY_API_KEY=your_shipday_api_key_here
STORE_ADDRESS=1989 North Fry Rd, Katy, TX 77494
STORE_PHONE_NUMBER=+12814010758

# Order Service Configuration
ORDER_SERVICE_HOST=0.0.0.0
ORDER_SERVICE_PORT=8000
ORDER_SERVICE_RELOAD=true

# Supabase Configuration (if needed)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF
    echo "📝 Please edit .env file with your actual API keys and configuration."
    echo "   Then run this script again."
    exit 1
fi

# Install dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies. Please check your Python environment."
    exit 1
fi

# Check if SHIPDAY_API_KEY is set
if grep -q "your_shipday_api_key_here" .env; then
    echo "⚠️  Please update your SHIPDAY_API_KEY in the .env file before running the service."
    exit 1
fi

# Start the service
echo "🌟 Starting the order service..."
echo "📍 Service will be available at: http://localhost:8000"
echo "📚 API documentation: http://localhost:8000/docs"
echo "🔍 Health check: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

# Run the service
python3 -m order_service.main 
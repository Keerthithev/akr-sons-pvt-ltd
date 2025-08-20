#!/bin/bash

echo "🚀 Starting Render deployment build..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# Go back to root
cd ..

# Copy dist folder to backend
echo "📁 Copying dist folder to backend..."
if [ -d "backend/dist" ]; then
    rm -rf backend/dist
fi

cp -r frontend/dist backend/

# Verify the copy
echo "🔍 Verifying build..."
if [ -d "backend/dist" ]; then
    echo "✅ Dist folder copied successfully!"
    echo "📁 Files in backend/dist: $(ls backend/dist | wc -l)"
    if [ -f "backend/dist/index.html" ]; then
        echo "📄 index.html exists: ✅"
    else
        echo "❌ index.html missing!"
        exit 1
    fi
else
    echo "❌ Dist folder was not copied to backend!"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "🚀 Ready for deployment on Render!" 
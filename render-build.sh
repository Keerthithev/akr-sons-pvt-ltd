#!/bin/bash

echo "🚀 Starting Render build process..."
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --production=false

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# Go back to root
cd ..

# Create backend/dist directory if it doesn't exist
echo "📁 Creating backend/dist directory..."
mkdir -p backend/dist

# Copy dist folder to backend
echo "📁 Copying dist folder to backend..."
cp -r frontend/dist/* backend/dist/

# Verify the copy
echo "🔍 Verifying build..."
echo "Backend directory contents:"
ls -la backend/
echo "Backend/dist directory contents:"
ls -la backend/dist/

if [ -f "backend/dist/index.html" ]; then
    echo "✅ index.html exists in backend/dist/"
    echo "📄 index.html first few lines:"
    head -5 backend/dist/index.html
else
    echo "❌ index.html missing from backend/dist/"
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Render build completed successfully!"
echo "🚀 Ready for deployment!" 
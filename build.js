import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting build process...');

try {
  // Step 1: Install frontend dependencies
  console.log('📦 Installing frontend dependencies...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });

  // Step 2: Build the frontend
  console.log('🔨 Building frontend...');
  execSync('cd frontend && npm run build', { stdio: 'inherit' });

  // Step 3: Copy dist folder to backend
  console.log('📁 Copying dist folder to backend...');
  const frontendDistPath = path.join(__dirname, 'frontend', 'dist');
  const backendDistPath = path.join(__dirname, 'backend', 'dist');

  // Remove existing dist folder in backend if it exists
  if (fs.existsSync(backendDistPath)) {
    fs.rmSync(backendDistPath, { recursive: true, force: true });
  }

  // Copy dist folder
  fs.cpSync(frontendDistPath, backendDistPath, { recursive: true });

  console.log('✅ Build completed successfully!');
  console.log('📂 Frontend built and copied to backend/dist');
  console.log('🚀 Ready for deployment on Render!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 
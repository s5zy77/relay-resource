const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("🚀 Starting Vercel Monorepo Unification Build...");

// 1. Build the Customer Portal
console.log("📦 Building Portal...");
execSync('npm run build', { cwd: path.join(__dirname, '../apps/portal'), stdio: 'inherit' });

// 2. Build the Admin Dashboard
console.log("📦 Building Admin...");
execSync('npm run build', { cwd: path.join(__dirname, '../apps/admin'), stdio: 'inherit' });

// 3. Unify in a single public dist folder for Vercel
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}
fs.mkdirSync(publicDir, { recursive: true });

console.log("🔄 Merging artifacts into /public ...");
fs.cpSync(path.join(__dirname, '../apps/portal/dist'), publicDir, { recursive: true });

const adminPublicDir = path.join(publicDir, 'admin');
fs.mkdirSync(adminPublicDir, { recursive: true });
fs.cpSync(path.join(__dirname, '../apps/admin/dist'), adminPublicDir, { recursive: true });

console.log("✅ Vercel Build Ready!");

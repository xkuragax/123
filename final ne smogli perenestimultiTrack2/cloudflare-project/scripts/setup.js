#!/usr/bin/env node
/**
 * Setup script for Cloudflare deployment
 * This script guides you through the initial setup
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(q) {
  return new Promise(resolve => rl.question(q, resolve));
}

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      stdio: 'inherit',
      ...options 
    });
  } catch (e) {
    console.error(`Command failed: ${command}`);
    process.exit(1);
  }
}

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Multitrack Player - Cloudflare Setup Assistant         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Check if wrangler is installed
  console.log('📦 Step 1: Checking wrangler CLI...');
  try {
    execSync('npx wrangler --version', { stdio: 'ignore' });
    console.log('   ✓ Wrangler already installed\n');
  } catch {
    console.log('   Installing wrangler...');
    exec('npm install -g wrangler');
  }

  // Login to Cloudflare
  console.log('🔐 Step 2: Login to Cloudflare...');
  console.log('   This will open a browser window. Please login with your Cloudflare account.');
  await question('   Press ENTER when ready...');
  exec('npx wrangler login');

  // Create D1 Database
  console.log('\n🗄️  Step 3: Creating D1 Database...');
  const dbName = 'multitrack-db';
  try {
    exec(`npx wrangler d1 create ${dbName}`);
    console.log('   ✓ Database created\n');
  } catch {
    console.log('   Database may already exist, continuing...\n');
  }

  // Get database ID and update wrangler.toml
  console.log('📝 Step 4: Getting Database ID...');
  console.log('   Please copy the "database_id" from the output above.');
  const dbId = await question('   Paste Database ID here: ');
  
  if (dbId) {
    const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');
    let wranglerContent = fs.readFileSync(wranglerPath, 'utf8');
    wranglerContent = wranglerContent.replace('database_id = "ЗАМЕНИТЬ_НА_ID_ИЗ_КОНСОЛИ"', `database_id = "${dbId}"`);
    fs.writeFileSync(wranglerPath, wranglerContent);
    console.log('   ✓ wrangler.toml updated\n');
  }

  // Create R2 Bucket
  console.log('🪣 Step 5: Creating R2 Bucket...');
  const bucketName = 'multitrack-files';
  try {
    exec(`npx wrangler r2 bucket create ${bucketName}`);
    console.log('   ✓ Bucket created\n');
  } catch {
    console.log('   Bucket may already exist, continuing...\n');
  }

  // Set admin password
  console.log('🔑 Step 6: Set Admin Password...');
  const password = await question('   Enter admin password (default: admin123): ');
  if (password) {
    const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');
    let wranglerContent = fs.readFileSync(wranglerPath, 'utf8');
    wranglerContent = wranglerContent.replace('ADMIN_PASSWORD = "admin123"', `ADMIN_PASSWORD = "${password}"`);
    fs.writeFileSync(wranglerPath, wranglerContent);
    
    // Also set as secret
    exec(`npx wrangler secret put ADMIN_TOKEN --name multitrack-api`, {
      input: password
    });
  }

  // Apply migrations
  console.log('\n📊 Step 7: Applying database migrations...');
  exec('npx wrangler d1 migrations apply multitrack-db');

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                  ✅ SETUP COMPLETE!                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log('Next steps:');
  console.log('  1. Deploy the Worker: npm run deploy');
  console.log('  2. Deploy the Frontend: npm run pages:deploy');
  console.log('  3. Import your data: npm run import:data');
  console.log('\n');
  console.log('Or run everything at once:');
  console.log('  npm run deploy:full');
  console.log('\n');

  rl.close();
}

main().catch(console.error);

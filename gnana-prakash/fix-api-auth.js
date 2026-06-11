const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('route.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src/app/api');
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip auth routes (NextAuth handles its own auth)
  if (file.includes('auth')) return;
  
  // Only process files that use getToken
  if (!content.includes('getToken')) return;
  
  let changed = false;
  
  // 1. Replace the import
  if (content.includes('import { getToken } from "next-auth/jwt";')) {
    content = content.replace(
      'import { getToken } from "next-auth/jwt";',
      'import { getAuthToken } from "@/lib/auth/getAuthToken";'
    );
    changed = true;
  }
  
  // 2. Replace all getToken calls with getAuthToken
  // Pattern: const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const pattern = /await getToken\(\{ req, secret: process\.env\.NEXTAUTH_SECRET \}\)/g;
  if (pattern.test(content)) {
    content = content.replace(
      /await getToken\(\{ req, secret: process\.env\.NEXTAUTH_SECRET \}\)/g,
      'await getAuthToken(req)'
    );
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    modifiedCount++;
    console.log('Updated: ' + path.relative('.', file));
  }
});

console.log('\nTotal updated: ' + modifiedCount + ' files.');

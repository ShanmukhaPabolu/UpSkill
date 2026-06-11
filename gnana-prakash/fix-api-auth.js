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

// Replace the complex two-line secureCookie pattern with a simple single getToken call
const complexPattern = /let token = await getToken\(\{ req, secret: process\.env\.NEXTAUTH_SECRET, secureCookie: process\.env\.NODE_ENV === 'production' \|\| req\.url\.startsWith\('https:\/\/'\) \}\);\s*\n\s*if \(!token\) token = await getToken\(\{ req, secret: process\.env\.NEXTAUTH_SECRET, secureCookie: false \}\);/g;

const simpleReplacement = `const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (complexPattern.test(content)) {
    // Reset regex state
    complexPattern.lastIndex = 0;
    content = content.replace(complexPattern, simpleReplacement);
    fs.writeFileSync(file, content);
    modifiedCount++;
    console.log('Fixed: ' + path.relative('.', file));
  }
});

console.log(`\nTotal fixed: ${modifiedCount} files.`);

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
  let changed = false;
  if (content.includes('\\n')) {
    content = content.replace(/\\n/g, '\n');
    changed = true;
  }
  if (content.includes("\\'")) {
    content = content.replace(/\\'/g, "'");
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(file, content);
    modifiedCount++;
  }
});

console.log('Fixed ' + modifiedCount + ' files.');

const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, files);
    } else if (fullPath.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

const replaceInFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace ['SUPER_ADMIN','DISTRICT_ADMIN'] with STATE_ADMIN
  content = content.replace(/\[\s*["']SUPER_ADMIN["']\s*,\s*["']DISTRICT_ADMIN["']\s*\]/g, '["SUPER_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN"]');

  // Replace role !== "SUPER_ADMIN"
  content = content.replace(/role !== ["']SUPER_ADMIN["']/g, '!["SUPER_ADMIN", "STATE_ADMIN"].includes((session.user as any).role)');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated: ' + file);
  }
};

const files = getFiles('src/app/api');
files.forEach(replaceInFile);

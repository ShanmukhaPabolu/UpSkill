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

const fixSyntaxInFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace incorrect syntax:
  // (session.user as any).!["SUPER_ADMIN", "STATE_ADMIN"].includes((session.user as any).role)
  // with:
  // !["SUPER_ADMIN", "STATE_ADMIN"].includes((session.user as any).role)
  content = content.replace(/\(session\.user as any\)\.!\["SUPER_ADMIN", "STATE_ADMIN"\]\.includes\(\(session\.user as any\)\.role\)/g, '!["SUPER_ADMIN", "STATE_ADMIN"].includes((session.user as any).role)');

  // Also catch if there's any stray `.!` around that I messed up
  // If there are other places where I did `role !== "SUPER_ADMIN"`, wait, was it always `(session.user as any).role !== "SUPER_ADMIN"`? Yes.

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed syntax in: ' + file);
  }
};

const files = getFiles('src/app/api');
files.forEach(fixSyntaxInFile);

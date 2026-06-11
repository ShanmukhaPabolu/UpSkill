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
  if (content.includes('getServerSession(authOptions)')) {
    content = content.replace(/import \{ getServerSession \} from "next-auth";/g, 'import { getToken } from "next-auth/jwt";');
    content = content.replace(/import \{ authOptions \} from "@\/lib\/auth\/options";\r?\n?/g, '');
    content = content.replace(/const session = await getServerSession\(authOptions\);/g, 'const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });\n    const session = token ? { user: token } : null;');
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
    modifiedCount++;
  }
});

console.log(`Updated ${modifiedCount} files.`);

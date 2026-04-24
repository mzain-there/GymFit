const fs = require('fs');
const path = require('path');

function replaceQuotes(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // replace: fetch(`${API_BASE}/plans')  -> fetch(`${API_BASE}/plans`)
  // essentially, look for `\$\{API_BASE\}\/[^'"]+['"]\)` and replace the trailing quote with a backtick.
  
  content = content.replace(/(`\$\{API_BASE\}\/[^'"]+)['"]/g, '$1`');
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js')) {
      replaceQuotes(fullPath);
    }
  }
}

processDir(path.join(__dirname, 'gymfit-frontend'));
console.log('Fixed quotes successfully.');

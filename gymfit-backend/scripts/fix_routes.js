const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace fetch('/api/... with fetch(`${API_BASE}/...
  // Handle single quotes
  content = content.replace(/fetch\('\/api\//g, "fetch(`${API_BASE}/");
  // The end quote needs to be changed to backtick or we just use API_BASE + '/...'
  
  // Actually, replacing fetch('/api/ with fetch(API_BASE + '/ is easier to match quotes.
  content = content.replace(/fetch\('\/api\//g, "fetch(API_BASE + '/");
  content = content.replace(/fetch\("\/api\//g, 'fetch(API_BASE + "/');
  content = content.replace(/fetch\(`\/api\//g, 'fetch(`${API_BASE}/');
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  }
}

processDir(path.join(__dirname, 'gymfit-frontend'));
console.log('Replaced fetch calls successfully.');

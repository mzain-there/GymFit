const fs = require('fs');
const path = require('path');

const pages = ['dashboard.html', 'members.html', 'plans.html', 'trainers.html'];
const dir = path.join(__dirname, 'gymfit-frontend');

for (const page of pages) {
  const filePath = path.join(dir, page);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Find the footer block
  const footerRegex = /<!-- ─── Footer ─────────────────────────────────────── -->\s*<footer class="site-footer"[^>]*>[\s\S]*?<\/footer>/;
  const footerMatch = content.match(footerRegex);
  
  if (footerMatch) {
    let footerHTML = footerMatch[0];
    
    // Remove the inline style
    footerHTML = footerHTML.replace(/style="margin-left: var\(--sidebar-width\); transition: margin-left var\(--transition\);"/, '');
    
    // Remove footer from its current position
    content = content.replace(footerMatch[0], '');
    
    // Insert it right before </div><!-- /main-content -->
    const target = '</div><!-- /main-content -->';
    if (content.includes(target)) {
      content = content.replace(target, footerHTML + '\n' + target);
      console.log(`Updated footer in ${page}`);
    } else {
      console.log(`Could not find main-content closing tag in ${page}`);
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

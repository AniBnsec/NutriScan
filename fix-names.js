const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'client', 'src', 'i18n', 'locales');
if (!fs.existsSync(localesDir)) {
    console.error('Could not find locales directory:', localesDir);
    process.exit(1);
}

const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.js'));
let totalReplaced = 0;

files.forEach(file => {
  const filePath = path.join(localesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replace all variations!
  content = content.replace(/NutriScan AI/g, 'NutriScan');
  content = content.replace(/Google Gemini AI/g, 'NutriScan');
  content = content.replace(/Google Gemini/g, 'NutriScan');

  if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated translations in ${file}`);
      totalReplaced++;
  }
});

console.log(`\nSuccess! Cleaned up names in ${totalReplaced} translation files.`);

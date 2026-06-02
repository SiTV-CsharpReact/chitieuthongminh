const fs = require('fs');
const path = './src/app/admin/cards/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove icons from section headers
content = content.replace(/<span className="material-symbols-outlined text-\[14px\]">.*?<\/span>\s*/g, '');

// Reduce padding in the section boxes
content = content.replace(/p-5 rounded-2xl/g, 'p-4 rounded-xl');

// Reduce vertical space between elements in the section boxes
content = content.replace(/space-y-4/g, 'space-y-2.5');

fs.writeFileSync(path, content);
console.log('Fixed padding and removed icons');

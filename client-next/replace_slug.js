const fs = require('fs');
const path = require('path');

const files = [
  'src/app/(client)/page.tsx',
  'src/app/(client)/cards/page.tsx',
  'src/app/(client)/recommendations/page.tsx',
  'src/app/(client)/settings/page.tsx',
  'src/components/CardItem.tsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Ensure import is present
  if (!content.includes('generateSlug')) {
    // Add it next to cleanCardName if it exists, else add a new import
    if (content.includes('cleanCardName')) {
      content = content.replace(/cleanCardName/g, 'cleanCardName, generateSlug');
    } else {
      // Find last import
      const lastImportIndex = content.lastIndexOf('import ');
      const endOfLastImport = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLastImport + 1) + "import { generateSlug } from '@/lib/utils';\n" + content.slice(endOfLastImport + 1);
    }
  }

  // Replace /card/${card.id} with /card/${generateSlug(card.name)}
  content = content.replace(/\/card\/\$\{card\.id\}/g, '/card/${generateSlug(card.name)}');
  
  // Replace /card/${cc.card.id} with /card/${generateSlug(cc.card.name)}
  content = content.replace(/\/card\/\$\{cc\.card\.id\}/g, '/card/${generateSlug(cc.card.name)}');

  fs.writeFileSync(fullPath, content);
  console.log(`Updated ${file}`);
});

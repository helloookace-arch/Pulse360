const fs = require('fs');
const path = require('path');

function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(function(file) {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile() && filepath.endsWith('.ts')) {
      callback(filepath);
    }
  });
}

walkSync('src/app/api', (file) => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace @ts-expect-error
  content = content.replace(/\/\/ @ts-expect-error/g, '// @ts-expect-error - Edge runtime types');

  // Fix clinics/nearby/route.ts, stories/route.ts unused 'error' variable
  if (file.includes('clinics') || file.includes('stories')) {
    content = content.replace(/catch \(\s*error\s*\)/g, 'catch');
  }

  // Fix payment/initiate/route.ts unused 'amount' variable
  if (file.includes('payment')) {
    content = content.replace(/const \{ amount, phone/g, 'const { phone');
    content = content.replace(/const \{ consultationId, amount, phone/g, 'const { consultationId, phone');
  }

  fs.writeFileSync(file, content);
});

// Fix learn/page.tsx unused ChevronRight
let learnPagePath = 'src/app/learn/page.tsx';
if (fs.existsSync(learnPagePath)) {
  let content = fs.readFileSync(learnPagePath, 'utf8');
  content = content.replace(/import \{.*?ChevronRight.*?\} from 'lucide-react';/, (match) => {
    return match.replace('ChevronRight,', '').replace('ChevronRight', '');
  });
  fs.writeFileSync(learnPagePath, content);
}

console.log('Done fixing errors');

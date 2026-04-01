const fs = require('fs');

const filesToRefactor = [
  'src/app/(landing)/events/page.tsx',
  'src/app/(landing)/events/[slug]/page.tsx',
  'src/components/BoardMembers.tsx',
  'src/components/MembersGallery.tsx',
  'src/app/layout.tsx'
];

const transforms = [
  { match: /bg-\[#080808\]/g, replace: 'bg-bg' },
  { match: /bg-\[#0a0a0a\]/g, replace: 'bg-bg-2' },
  { match: /bg-\[#111111\]/g, replace: 'bg-bg-2' },
  { match: /bg-\[#050505\]/g, replace: 'bg-bg-2' },
  
  { match: /text-white\/40/g, replace: 'text-muted-2' },
  { match: /text-white\/60/g, replace: 'text-muted' },
  { match: /text-white\/50/g, replace: 'text-muted-2' },
  { match: /text-white\/30/g, replace: 'text-muted' },
  { match: /text-white\/20/g, replace: 'text-muted-2' },
  { match: /text-white\/10/g, replace: 'text-muted-2' },
  { match: /text-white\/70/g, replace: 'text-text/70' },
  { match: /text-white\/80/g, replace: 'text-text/80' },
  { match: /text-white\/90/g, replace: 'text-text/90' },
  
  // Be careful with exactly "text-white"
  { match: /text-white(?![/\w])/g, replace: 'text-text' },
  
  // Be careful with "text-black"
  { match: /text-black(?![/\w])/g, replace: 'text-bg' },

  // Background white
  { match: /bg-white\/5(?![/\w])/g, replace: 'bg-surface-2' },
  { match: /bg-white\/10(?![/\w])/g, replace: 'bg-surface-2' },
  { match: /bg-white\/20(?![/\w])/g, replace: 'bg-surface-2' },
  { match: /bg-white\/\[0\.03\]/g, replace: 'bg-surface' },
  { match: /bg-white\/\[0\.05\]/g, replace: 'bg-surface-2' },
  { match: /bg-white\/\[0\.02\]/g, replace: 'bg-surface' },
  { match: /bg-white\/\[0\.01\]/g, replace: 'bg-bg-2' },
  { match: /bg-white(?![/\w])/g, replace: 'bg-text' },
  
  // Borders
  { match: /border-white\/10/g, replace: 'border-border-2' },
  { match: /border-white\/5/g, replace: 'border-border' },
  { match: /border-white\/20/g, replace: 'border-border-2' },
  
  // Rings
  { match: /ring-white\/10/g, replace: 'ring-border-2' },
  
  // Inline styles replacements for [slug]/page.tsx and others
  { match: /className="min-h-screen" style=\{\{\s*background:\s*"#080808",\s*color:\s*"#f0f0f0"\s*\}\}/g, replace: 'className="min-h-screen bg-bg text-text"' },
  { match: /style=\{\{\s*color:\s*"rgba\(255,255,255,0\.4\)"\s*\}\}/g, replace: 'className="text-muted"' },
  { match: /style=\{\{\s*background:\s*"#0f0f0f",\s*border:\s*"1px solid rgba\(255,255,255,0\.08\)"\s*\}\}/g, replace: 'className="bg-bg-2 border border-border-2"' },
  { match: /style=\{\{\s*borderColor:\s*"rgba\(255,255,255,0\.06\)",\s*background:\s*"#151515"\s*\}\}/g, replace: 'className="border-border bg-surface"' },
  { match: /style=\{\{\s*background:\s*"rgba\(255,255,255,0\.15\)"\s*\}\}/g, replace: 'className="bg-muted"' },
  { match: /style=\{\{\s*background:\s*"rgba\(255,255,255,0\.1\)"\s*\}\}/g, replace: 'className="bg-muted-2"' },
  { match: /style=\{\{\s*background:\s*"rgba\(255,255,255,0\.07\)"\s*\}\}/g, replace: 'className="bg-surface-2"' },
  { match: /style=\{\{\s*color:\s*"rgba\(255,255,255,0\.3\)"\s*\}\}/g, replace: 'className="text-muted"' },
  { match: /style=\{\{\s*width:\s*200,\s*height:\s*200,\s*border:\s*"1px solid rgba\(255,255,255,0\.08\)"\s*\}\}/g, replace: 'className="border border-border w-[200px] h-[200px]"' },
  { match: /style=\{\{\s*background:\s*"rgba\(255,255,255,0\.05\)",\s*color:\s*"rgba\(255,255,255,0\.5\)",\s*border:\s*"1px solid rgba\(255,255,255,0\.1\)"\s*\}\}/g, replace: 'className="bg-surface text-muted-2 border border-border-2"' },
  { match: /style=\{\{\s*color:\s*"#ffffff"\s*\}\}/g, replace: 'className="text-text"' },
  { match: /style=\{\{\s*color:\s*"rgba\(255,255,255,0\.65\)"\s*\}\}/g, replace: 'className="text-muted-2"' },
  { match: /style=\{\{\s*border:\s*"1px solid rgba\(255,255,255,0\.07\)"\s*\}\}/g, replace: 'className="border border-border"' },
  { match: /style=\{\{\s*background:\s*"#ffffff",\s*color:\s*"#080808"\s*\}\}/g, replace: 'className="bg-text text-bg"' },
  { match: /style=\{\{\s*color:\s*"rgba\(255,255,255,0\.8\)"\s*\}\}/g, replace: 'className="text-text/80"' },
  
  // BoardMembers
  { match: /bg-\[#A9A9A9\]/g, replace: 'bg-surface' },
  { match: /bg-gradient-to-t from-\[#080808\]/g, replace: 'bg-gradient-to-t from-bg' },

  // MembersGallery
  { match: /border-t border-white\/5/g, replace: 'border-t border-border' }
];

filesToRefactor.forEach(filepath => {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    transforms.forEach(t => {
      content = content.replace(t.match, t.replace);
    });
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Refactored ${filepath}`);
  } catch (e) {
    console.error(`Error processing ${filepath}:`, e);
  }
});

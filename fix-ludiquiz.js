const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/create/ludiquiz/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// The replacement added the hook right after the context hook.
// I'll extract it and move it down.
const hookRegex = /const searchParams = useSearchParams\(\);[\s\S]*?loadActivity\(\);\n    \}, \[.*?\]\);/m;
const match = code.match(hookRegex);

if (match) {
    code = code.replace(match[0], '');
    
    // insert it right before the sync effect
    const syncEffectRegex = /\/\/ --- Sincronizar preguntas locales con el contexto global ---/m;
    
    code = code.replace(syncEffectRegex, `${match[0]}\n\n    // --- Sincronizar preguntas locales con el contexto global ---`);
    fs.writeFileSync(filePath, code);
} else {
    console.log("Not found");
}


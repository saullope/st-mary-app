const fs = require('fs');
const file = 'src/components/editor/LoadMultimediaFile.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '{type === "image" && url && (',
  '{(type === "image" || (url && (url.includes("firebasestorage") || url.includes("unsplash")) && type !== "video" && type !== "audio")) && url && ('
);

fs.writeFileSync(file, code);

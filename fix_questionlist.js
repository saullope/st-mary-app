const fs = require('fs');
const file = 'src/components/editor/QuestionListItem.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '{mediaType === "image" && mediaUrl ? (',
  '{(mediaType === "image" || (mediaUrl && (mediaUrl.includes("firebasestorage") || mediaUrl.includes("unsplash")) && mediaType !== "video" && mediaType !== "audio")) && mediaUrl ? ('
);

fs.writeFileSync(file, code);

const fs = require('fs');
const file = 'src/app/actions/getActivityForEdit.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `        let mediaType = mediaResource?.tipo?.nombre || null;
        if (mediaType === "imagen") mediaType = "image";`;

const replacement = `        let mediaTypeRaw = mediaResource?.tipo?.nombre?.toLowerCase() || null;
        let mediaType = mediaTypeRaw;
        if (mediaTypeRaw === "imagen") mediaType = "image";
        
        // Check origin for youtube
        const originName = mediaResource?.origen?.nombre?.toLowerCase();
        if (originName === "youtube") {
          mediaType = "youtube";
        }`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);

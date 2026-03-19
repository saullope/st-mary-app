const fs = require('fs');
const file = 'src/app/actions/getActivityForEdit.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "const mediaResource = p.preguntaRecursos?.find((pr: any) => pr.rol === 'principal')?.recurso;",
  "const mediaResource = p.preguntaRecursos?.find((pr: any) => pr.rol?.toLowerCase()?.trim() === 'principal')?.recurso;"
);

code = code.replace(
  "let mediaTypeRaw = mediaResource?.tipo?.nombre?.toLowerCase() || null;",
  "let mediaTypeRaw = mediaResource?.tipo?.nombre?.toLowerCase()?.trim() || null;"
);

code = code.replace(
  'if (mediaTypeRaw === "imagen") mediaType = "image";',
  'if (mediaTypeRaw === "imagen" || mediaTypeRaw === "image") mediaType = "image";\n        if (mediaTypeRaw === "video" || mediaTypeRaw === "youtube") mediaType = "video";\n        if (mediaTypeRaw === "audio") mediaType = "audio";'
);

code = code.replace(
  "const originName = mediaResource?.origen?.nombre?.toLowerCase();",
  "const originName = mediaResource?.origen?.nombre?.toLowerCase()?.trim();"
);

fs.writeFileSync(file, code);

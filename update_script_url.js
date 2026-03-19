const fs = require('fs');
const file = 'src/app/actions/getActivityForEdit.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "mediaUrl: mediaResource?.url || null,",
  "mediaUrl: mediaResource?.url?.trim() || null,"
);

fs.writeFileSync(file, code);

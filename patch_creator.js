const fs = require('fs');
const file = 'src/components/dashboard/CreatorCard.tsx';
let content = fs.readFileSync(file, 'utf8');

// The file has two places where <Image is used for the avatar
content = content.replace(
  /className="rounded-circle border border-1 border-secondary"/,
  'className="rounded-circle border border-1 border-secondary"\n                    unoptimized={true}'
);

content = content.replace(
  /className="rounded-circle"\n                            style={{ objectFit: "cover" }}/,
  'className="rounded-circle"\n                            style={{ objectFit: "cover" }}\n                            unoptimized={true}'
);

fs.writeFileSync(file, content);

const fs = require('fs');
const file = 'src/components/dashboard/NavBarDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/priority={false}/, 'priority={false}\n                                                unoptimized={true}');

fs.writeFileSync(file, content);

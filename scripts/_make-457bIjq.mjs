import fs from 'fs';
let c=fs.readFileSync('scripts/_resolve-one.mjs','utf8');
c=c.replace(/const SHORT = '[^']+'/, "const SHORT = 'https://amzn.to/457bIjq'");
fs.writeFileSync('scripts/_resolve-once-457bIjq.mjs', c);

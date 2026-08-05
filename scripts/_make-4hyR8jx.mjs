import fs from 'fs';
let c=fs.readFileSync('scripts/_resolve-one.mjs','utf8');
c=c.replace(/const SHORT = '[^']+'/, "const SHORT = 'https://amzn.to/4hyR8jx'");
fs.writeFileSync('scripts/_resolve-once-4hyR8jx.mjs', c);

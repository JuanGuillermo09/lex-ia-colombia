const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || '/api';
const filePath = path.resolve(__dirname, '..', 'src', 'environments', 'environment.ts');
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace(/apiUrl:\s*'[^']*'/g, `apiUrl: '${apiUrl}'`);
fs.writeFileSync(filePath, content);
console.log(`Environment configured: apiUrl = ${apiUrl}`);

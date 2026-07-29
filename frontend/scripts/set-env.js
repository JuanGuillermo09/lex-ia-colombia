const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || '/api';
const filePath = path.resolve(__dirname, '..', 'src', 'environments', 'environment.prod.ts');
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace('__API_URL__', apiUrl);
fs.writeFileSync(filePath, content);
console.log(`Environment configured: apiUrl = ${apiUrl}`);

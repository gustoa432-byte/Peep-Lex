import * as fs from 'fs';

const p = 'src/components/ui/BodyEditorOverlay.tsx';
let d = fs.readFileSync(p, 'utf8');

const lines = d.split('\n');
console.log('Lines 100-110:');
for (let i = 100; i <= 110; i++) {
  console.log(`[${i}]`, Buffer.from(lines[i] || '').toString('hex'), '=>', lines[i]);
}

const newLines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Аксы')) {
    newLines.push(lines[i]);
    newLines.push('            </button>');
    let j = i + 1;
    while (!lines[j].includes('          </div>')) {
      j++;
    }
    i = j - 1; 
  } else {
    newLines.push(lines[i]);
  }
}
fs.writeFileSync(p, newLines.join('\n'));
console.log('Done fixing file!');

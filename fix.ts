import * as fs from 'fs';

const p = 'src/components/ui/BodyEditorOverlay.tsx';
let d = fs.readFileSync(p, 'utf8');

// The issue: "             </button>\n            </button>"
// Let's replace </button> followed by anything up to </button> with a single </button> or just remove the corrupted string.
// Let's print out what is there:
const lines = d.split('\n');
console.log('Lines 100-110:');
for (let i = 100; i <= 110; i++) {
  console.log(`[${i}]`, Buffer.from(lines[i] || '').toString('hex'), '=>', lines[i]);
}

// Let's correct it by slicing lines or replacing.
const newLines = [];
let skip = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Аксы')) {
    newLines.push(lines[i]);
    newLines.push('            </button>');
    // fast forward until `</div>` that closes tabs
    let j = i + 1;
    while (!lines[j].includes('          </div>')) {
      j++;
    }
    i = j - 1; // loop will increment `i` to `j`, so `lines[j]` which is `</div>` will be added
  } else {
    newLines.push(lines[i]);
  }
}
fs.writeFileSync(p, newLines.join('\n'));
console.log('Done fixing file!');

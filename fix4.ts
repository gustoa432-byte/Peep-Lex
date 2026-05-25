import fs from 'fs';

const files = [
  'src/components/ui/BodyEditorOverlay.tsx',
  'src/components/ui/common/Slider.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/to-black\/20/g, 'to-black/40');
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});

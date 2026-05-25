import fs from 'fs';

const files = [
  'src/components/ui/BodyEditorOverlay.tsx',
  'src/components/ui/common/Slider.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/from-purple-500\/60 to-purple-500\/10/g, 'from-purple-500/60 to-black/20');
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});

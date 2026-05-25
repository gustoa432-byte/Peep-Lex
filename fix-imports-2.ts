import fs from 'fs';

const files = [
  'src/features/roomBuilder/EnvironmentSettings.tsx',
  'src/features/roomBuilder/RoomSettings.tsx',
  'src/features/roomBuilder/ui/RadialStampMenu.tsx',
  'src/features/roomBuilder/ui/RoomEditorTopBar.tsx',
  'src/features/worldExploration/3d/Slingshot.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace dynamic imports e.g. await import('../../lib/supabase')
    content = content.replace(/import\(['"](\.\.\/)+([^'"]+)['"]\)/g, (match, prefix, rest) => {
        let count = match.split('../').length - 1;
        let newDots = '../'.repeat(count + 1);
        return `import('${newDots}${rest}')`;
    });

    // Replace static imports from
    content = content.replace(/from\s+['"](\.\.\/)+([^'"]+)['"]/g, (match, prefix, rest) => {
        let count = match.split('../').length - 1;
        let newDots = '../'.repeat(count + 1);
        return `from '${newDots}${rest}'`;
    });

    // Replace static imports direct
    content = content.replace(/import\s+['"](\.\.\/)+([^'"]+)['"]/g, (match, prefix, rest) => {
        let count = match.split('../').length - 1;
        let newDots = '../'.repeat(count + 1);
        return `import '${newDots}${rest}'`;
    });
    
    fs.writeFileSync(file, content);
  }
});

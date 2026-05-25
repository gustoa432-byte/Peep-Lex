import fs from 'fs';

let content = fs.readFileSync('src/components/ui/BodyEditorOverlay.tsx', 'utf8');

// Specific top area tab styling
content = content.replace(/<div className="flex bg-black\/80 rounded-\[28px\] p-1\.5 w-full gap-1 shadow-xl">/g, '<div className="flex bg-black/80 rounded-[20px] p-1 w-full gap-0.5 shadow-xl">');
content = content.replace(/py-2\.5/g, 'py-1.5');
content = content.replace(/rounded-\[22px\]/g, 'rounded-[16px]');
content = content.replace(/size=\{22\}/g, 'size={18}');

// Bottom panels container
content = content.replace(/bg-black\/80 rounded-\[28px\] p-5 flex flex-col gap-4 shadow-xl/g, 'bg-black/80 rounded-[24px] p-3 flex flex-col gap-2.5 shadow-xl');
content = content.replace(/bg-black\/80 rounded-\[28px\] p-4 flex flex-col gap-4 shadow-xl/g, 'bg-black/80 rounded-[24px] p-3 flex flex-col gap-2.5 shadow-xl');

// Text sizing down
content = content.replace(/text-\[11px\]/g, 'text-[10px]');
content = content.replace(/text-\[13px\]/g, 'text-[11px]');

// Interactive elements
content = content.replace(/w-10 h-10/g, 'w-8 h-8');
content = content.replace(/w-14 h-14/g, 'w-10 h-10');
content = content.replace(/text-3xl/g, 'text-2xl');
content = content.replace(/py-3 px-2 rounded-2xl/g, 'py-2 px-1.5 rounded-xl');

// Dummy Panel Scaling
content = content.replace(/className="shrink-0 flex items-center justify-center bg-black\/80 p-4 rounded-3xl shadow-xl"/, 'className="shrink-0 flex items-center justify-center bg-black/80 p-3 rounded-2xl shadow-lg scale-[0.8] origin-right"');

fs.writeFileSync('src/components/ui/BodyEditorOverlay.tsx', content);

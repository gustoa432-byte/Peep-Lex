import fs from 'fs';

let code = fs.readFileSync('src/managers/CharacterController.ts', 'utf8');

code = code.replace(/} else if \(appMode === 'room'\) {/g, "} else if (isRoomOrVoxel) {");
code = code.replace(/if \(appMode === 'room'\) {/g, "if (isRoomOrVoxel) {");
// There is also ternary operators like appMode === 'room' ? ... 
code = code.replace(/appMode === 'room' \?/g, "isRoomOrVoxel ?");

fs.writeFileSync('src/managers/CharacterController.ts', code);

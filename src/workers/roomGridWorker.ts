// roomGridWorker.ts
const CHUNK_SIZE = 16;
let chunks = new Map();

self.onmessage = (e) => {
  const { type, payload } = e.data;
  
  if (type === 'SET_BLOCKS') {
    // Build spatial hash
    const blockList = payload;
    chunks = new Map();
    for (let i = 0; i < blockList.length; i++) {
      const obj = blockList[i];
      const cx = Math.floor(obj.position[0] / CHUNK_SIZE);
      const cz = Math.floor(obj.position[2] / CHUNK_SIZE);
      const chunkId = `${cx}_${cz}`;
      
      const arr = chunks.get(chunkId);
      if (arr) {
        arr.push(obj);
      } else {
        chunks.set(chunkId, [obj]);
      }
    }
    
    // Send back ready chunks to main thread to stop double calculation
    self.postMessage({ type: 'CHUNKS_UPDATED', payload: Object.fromEntries(chunks) });
  } else if (type === 'ADD_BLOCKS') {
    const blockList = payload;
    for (let i = 0; i < blockList.length; i++) {
      const obj = blockList[i];
      const cx = Math.floor(obj.position[0] / CHUNK_SIZE);
      const cz = Math.floor(obj.position[2] / CHUNK_SIZE);
      const chunkId = `${cx}_${cz}`;
      const arr = chunks.get(chunkId);
      if (arr) {
        arr.push(obj);
      } else {
        chunks.set(chunkId, [obj]);
      }
    }
    self.postMessage({ type: 'CHUNKS_UPDATED', payload: Object.fromEntries(chunks) });
  } else if (type === 'REMOVE_BLOCK') {
    const objectId = payload;
    let modified = false;
    for (const [key, arr] of chunks.entries()) {
      const idx = arr.findIndex((o: any) => o.id === objectId);
      if (idx !== -1) {
        arr.splice(idx, 1);
        modified = true;
        break;
      }
    }
    if (modified) {
      self.postMessage({ type: 'CHUNKS_UPDATED', payload: Object.fromEntries(chunks) });
    }
  } else if (type === 'GET_NEARBY') {
    const { x, z, radius, reqId } = payload;
    const nearby = [];
    const minCx = Math.floor((x - radius) / CHUNK_SIZE);
    const maxCx = Math.floor((x + radius) / CHUNK_SIZE);
    const minCz = Math.floor((z - radius) / CHUNK_SIZE);
    const maxCz = Math.floor((z + radius) / CHUNK_SIZE);
    
    const rSq = radius * radius;
    
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cz = minCz; cz <= maxCz; cz++) {
        const chunkId = `${cx}_${cz}`;
        const blocks = chunks.get(chunkId);
        if (blocks) {
          for (let i = 0; i < blocks.length; i++) {
            const b = blocks[i];
            const dx = b.position[0] - x;
            const dz = b.position[2] - z;
            // Precise radius check before sending back to main thread
            if (dx * dx + dz * dz <= rSq) {
              nearby.push(b);
            }
          }
        }
      }
    }
    
    self.postMessage({ type: 'NEARBY_BLOCKS', payload: nearby, reqId });
  }
};

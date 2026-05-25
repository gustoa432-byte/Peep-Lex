import * as THREE from 'three';

export type TextureGenerator = (key: string) => THREE.Texture | null;

class AssetManagerClass {
  textures: Map<string, THREE.Texture> = new Map();
  audioBuffers: Map<string, AudioBuffer> = new Map();
  
  onProgress: ((progress: number) => void) | null = null;
  totalAssets = 0;
  loadedAssets = 0;

  private generators: Map<string, TextureGenerator> = new Map();

  private assetList = [
    't-grass', 't-concrete', 't-dirt', 't-stone', 't-wood', 't-brick',
    'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'
  ];

  async preload() {
    this.totalAssets = this.assetList.length;
    this.loadedAssets = 0;
    
    // Fake preload delay for demonstration & generation
    for (const key of this.assetList) {
      if (!this.textures.has(key)) {
        this.getTexture(key);
      }
      this.loadedAssets++;
      if (this.onProgress) {
        this.onProgress(this.loadedAssets / this.totalAssets);
      }
      // yield to frame
      await new Promise(r => setTimeout(r, 10));
    }
  }

  registerGenerator(prefix: string, generator: TextureGenerator) {
    this.generators.set(prefix, generator);
  }

  getTexture(key: string): THREE.Texture | null {
    if (this.textures.has(key)) {
      return this.textures.get(key)!;
    }

    if (key.startsWith('linear-gradient')) {
        const matches = key.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g);
        if (matches && matches.length >= 2) {
          const canvas = document.createElement('canvas');
          canvas.width = 512; canvas.height = 512;
          const ctx = canvas.getContext('2d')!;
          const grad = ctx.createLinearGradient(0, 0, 0, 512);
          grad.addColorStop(0, matches[0]);
          grad.addColorStop(1, matches[1]);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 512, 512);
          const texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.needsUpdate = true;
          this.textures.set(key, texture);
          return texture;
        }
    }

    // fallback to generic generators
    for (const [prefix, generator] of this.generators.entries()) {
      if (key.startsWith(prefix)) {
        const tex = generator(key);
        if (tex) {
          this.textures.set(key, tex);
          return tex;
        }
      }
    }

    return null;
  }
  
  getOrCreateTexture(key: string, creator: () => THREE.Texture): THREE.Texture {
    if (!this.textures.has(key)) {
        const tex = creator();
        this.textures.set(key, tex);
    }
    return this.textures.get(key)!;
  }
  
  cacheTexture(key: string, texture: THREE.Texture) {
      if(!this.textures.has(key)) {
          this.textures.set(key, texture);
      }
  }
}

export const AssetManager = new AssetManagerClass();

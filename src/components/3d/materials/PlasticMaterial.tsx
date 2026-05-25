import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
// import { Outlines } from '@react-three/drei';
import { AssetManager } from '../../../managers/AssetManager';

AssetManager.registerGenerator('p1', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#4B5320'; ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#78866B'; ctx.beginPath(); ctx.arc(100, 100, 120, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#556B2F'; ctx.beginPath(); ctx.arc(400, 300, 160, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#223300'; ctx.beginPath(); ctx.arc(200, 440, 100, 0, Math.PI * 2); ctx.fill();
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
});
AssetManager.registerGenerator('p3', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 512, 0, 0);
    grad.addColorStop(0, '#ffcc00');
    grad.addColorStop(0.3, '#ff6600');
    grad.addColorStop(0.6, '#cc0000');
    grad.addColorStop(1, '#ffcc00');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < 200; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#ffcc00' : '#ff4500';
        ctx.globalAlpha = Math.random() * 0.5 + 0.1;
        const cx = Math.random() * 512;
        const cy = Math.random() * 512;
        const r = 10 + Math.random() * 40;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                ctx.beginPath();
                ctx.arc(cx + dx * 512, cy + dy * 512, r, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
});
AssetManager.registerGenerator('p4', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#00ffff');
    grad.addColorStop(1, '#00008b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.beginPath();
    for (let i = 0; i < 512; i+=20) {
        ctx.moveTo(0, i);
        ctx.bezierCurveTo(150, i - 50, 350, i + 50, 512, i);
    }
    ctx.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
});
AssetManager.registerGenerator('p5', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000022';
    ctx.fillRect(0, 0, 512, 512);
    
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(250, 0);
    ctx.lineTo(200, 150);
    ctx.lineTo(300, 200);
    ctx.lineTo(150, 350);
    ctx.lineTo(250, 350);
    ctx.lineTo(100, 512);
    ctx.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
});
AssetManager.registerGenerator('p6', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#ff0000';
    for(let i=0; i<560; i+=64) {
        for(let j=0; j<560; j+=64) {
        ctx.beginPath();
        ctx.arc(i + ((j/64)%2 * 32), j, 20, 0, Math.PI * 2);
        ctx.fill();
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
});
AssetManager.registerGenerator('p7', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#6b21a8'; // Vibrant purple
    ctx.fillRect(0, 0, 512, 512);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const drawQuestion = (x: number, y: number, s: number, a: number, c: string) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.font = `bold ${s}px Arial, sans-serif`;
        ctx.fillStyle = c;
        ctx.fillText('?', 0, 0);
        ctx.lineWidth = s * 0.05;
        ctx.strokeStyle = '#000000';
        ctx.strokeText('?', 0, 0);
        ctx.restore();
    };

    const Qs = [
        [100, 100, 120, -0.3, '#3b82f6'],
        [400, 150, 90, 0.4, '#10b981'],
        [250, 250, 150, 0.1, '#f59e0b'],
        [120, 380, 100, -0.5, '#ef4444'],
        [380, 400, 130, 0.2, '#ec4899'],
        [50, 250, 70, 0.3, '#fcd34d'],
        [250, 80, 60, -0.2, '#6ee7b7'],
        [450, 280, 80, -0.4, '#93c5fd']
    ];
    
    for (const q of Qs) {
        drawQuestion(q[0] as number, q[1] as number, q[2] as number, q[3] as number, q[4] as string);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
});
AssetManager.registerGenerator('p8', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 15;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(160, 180, 25, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(352, 180, 25, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(150, 320); ctx.lineTo(362, 320); ctx.stroke();
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
});
AssetManager.registerGenerator('p9', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#facc9e';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#d29a62';
    for(let i=0; i<100; i++) {
        ctx.beginPath();
        ctx.arc(Math.random()*512, Math.random()*512, Math.random()*15, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.fillStyle = '#4a2f1d';
    ctx.font = 'bold 42px "Comic Sans MS", cursive, sans-serif'; 
    for(let j=0; j<10; j++) {
        ctx.fillText("NYEH HEH HEH!", Math.random()*300 - 50, j*60);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
});
AssetManager.registerGenerator('p10', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#fff';
    for(let i=0; i<15; i++) {
        ctx.font = '64px sans-serif';
        ctx.fillText("💀", Math.random()*450, Math.random()*450 + 50);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
});
AssetManager.registerGenerator('t-grass', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#498c36'; // Darker Minecraft-like grass green
    ctx.fillRect(0, 0, 512, 512);
    for(let i=0; i<5000; i++) {
        ctx.fillStyle = `rgba(0,0,0, ${Math.random() * 0.1})`;
        const s = 2 + Math.random()*6;
        ctx.fillRect(Math.random()*512, Math.random()*512, s, s);
        ctx.fillStyle = `rgba(255,255,255, ${Math.random() * 0.1})`;
        const s2 = 1 + Math.random()*4;
        ctx.fillRect(Math.random()*512, Math.random()*512, s2, s2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    texture.repeat.set(100, 100);
    return texture;
});
AssetManager.registerGenerator('t-concrete', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#888888';
    ctx.fillRect(0, 0, 512, 512);
    for(let i=0; i<5000; i++) {
        ctx.fillStyle = `rgba(0,0,0, ${Math.random() * 0.1})`;
        const s = 2 + Math.random()*6;
        ctx.fillRect(Math.random()*512, Math.random()*512, s, s);
        ctx.fillStyle = `rgba(255,255,255, ${Math.random() * 0.1})`;
        const s2 = 1 + Math.random()*4;
        ctx.fillRect(Math.random()*512, Math.random()*512, s2, s2);
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    for(let i=0; i<512; i+=128) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    texture.repeat.set(100, 100);
    return texture;
});
AssetManager.registerGenerator('t-dirt', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#6b4423'; // Base brown dirt color
    ctx.fillRect(0, 0, 512, 512);
    for(let i=0; i<5000; i++) {
        ctx.fillStyle = `rgba(0,0,0, ${Math.random() * 0.1})`;
        const s = 2 + Math.random()*6;
        ctx.fillRect(Math.random()*512, Math.random()*512, s, s);
        ctx.fillStyle = `rgba(255,255,255, ${Math.random() * 0.1})`;
        const s2 = 1 + Math.random()*4;
        ctx.fillRect(Math.random()*512, Math.random()*512, s2, s2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    texture.repeat.set(100, 100);
    return texture;
});
AssetManager.registerGenerator('t-stone', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 512, 512);
    for(let i=0; i<3000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#64748b' : '#cbd5e1';
        ctx.fillRect(Math.random()*512, Math.random()*512, 3 + Math.random()*5, 3 + Math.random()*5);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    // Tile smaller to keep detail but large enough to look good on blocks
    texture.repeat.set(100, 100);
    return texture;
});
AssetManager.registerGenerator('t-wood', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 0, 512, 512);
    for(let i=0; i<100; i++) {
        ctx.strokeStyle = Math.random() > 0.5 ? '#78350f' : '#d97706';
        ctx.lineWidth = 1 + Math.random()*3;
        ctx.beginPath();
        let x = Math.random() * 512;
        ctx.moveTo(x, 0);
        for(let y=0; y<=512; y+=50) {
            x += (Math.random() - 0.5) * 10;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    texture.repeat.set(100, 100);
    return texture;
});
AssetManager.registerGenerator('t-brick', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#e5e5e5'; // mortar
    for(let y=0; y<512; y+=32) {
        ctx.fillRect(0, y, 512, 4);
        let offset = (y/32)%2 === 0 ? 0 : 32;
        for(let x=0; x<512; x+=64) {
            ctx.fillRect(x + offset, y, 4, 32);
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    texture.repeat.set(100, 100);
    return texture;
});
AssetManager.registerGenerator('t-splat', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 128, 128); // Transparent background
    ctx.fillStyle = '#ffffff';
    
    // Draw main blob with jagged edges
    ctx.beginPath();
    for(let i=0; i<=20; i++){
        const a = (i/20) * Math.PI * 2;
        const r = 25 + Math.random() * 10;
        if(i===0) ctx.moveTo(64 + Math.cos(a)*r, 64 + Math.sin(a)*r);
        else ctx.lineTo(64 + Math.cos(a)*r, 64 + Math.sin(a)*r);
    }
    ctx.fill();
    
    // Add small scattered droplets
    for(let i=0; i<8; i++){
        const angle = Math.random() * Math.PI * 2;
        const dist = 35 + Math.random() * 20;
        ctx.beginPath();
        ctx.arc(64 + Math.cos(angle)*dist, 64 + Math.sin(angle)*dist, 2 + Math.random()*5, 0, Math.PI*2);
        ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
});

AssetManager.registerGenerator('flex-ring', (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 4096; canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const text = 'FLEX';
    const numRepetitions = 16;
    for (let i = 0; i < numRepetitions; i++) {
        const x = (i + 0.5) * (canvas.width / numRepetitions);
        ctx.fillText(text, x, canvas.height / 2 + 5);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
});

interface PlasticMaterialProps {
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  pulse?: boolean;
  outlineThickness?: number;
  hasBlockOutline?: boolean;
  attach?: string;
}

export const PlasticMaterial: React.FC<PlasticMaterialProps> = ({ 
  color = '#ffffff', 
  emissive = '#ffffff', 
  emissiveIntensity = 0, 
  transparent = false, 
  opacity = 1,
  pulse = false,
  outlineThickness = 0.05,
  hasBlockOutline = false,
  attach
}) => {
  const materialRef = useRef<THREE.MeshLambertMaterial>(null);
  
  const blockOutlineTexture = React.useMemo(() => {
    if (!hasBlockOutline) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 10;
      ctx.strokeRect(0, 0, 128, 128);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    return tex;
  }, [hasBlockOutline]);
  
  const processColor: any = React.useMemo(() => {
    try {
      const cachedTx = AssetManager.getTexture(color);
      if (cachedTx) {
          let customProps = {};
          if (color.startsWith('p2')) {
              customProps = { emissive: '#ffff00', emissiveIntensity: 1, isEffect2: true };
          } else if (color.startsWith('p3')) {
              customProps = { emissive: '#ff4400', emissiveIntensity: 0.3, isEffect3: true };
          } else if (color.startsWith('t-dirt')) {
              customProps = { roughness: 1.0, metalness: 0 };
          } else if (color.startsWith('t-grass') || color.startsWith('t-stone') || color.startsWith('t-brick')) {
              customProps = { roughness: 0.9, metalness: 0 };
          } else if (color.startsWith('t-concrete') || color.startsWith('t-wood')) {
              customProps = { roughness: 0.8, metalness: 0 };
          }
          return { color: '#ffffff', map: cachedTx, ...customProps };
      }
      
      new THREE.Color(color);
      return { color, map: null };
    } catch {
      return { color: '#ffffff', map: null };
    }
  }, [color]);

  // Use useMemo to avoid recreating these colors every frame
  const limeColor = React.useMemo(() => new THREE.Color('#39ff14'), []);
  const pinkColor = React.useMemo(() => new THREE.Color('#ff1493'), []);
  const darkBaseColor = React.useMemo(() => new THREE.Color('#222222'), []);
  const originalColor = React.useMemo(() => new THREE.Color(processColor.color), [processColor.color]);

  React.useEffect(() => {
    if (materialRef.current) {
      materialRef.current.needsUpdate = true;
      if (!processColor.isEffect2 && !processColor.isEffect3 && !pulse) {
        const finalEmissiveIntensity = typeof processColor.emissiveIntensity === 'number' ? processColor.emissiveIntensity : emissiveIntensity;
        materialRef.current.emissiveIntensity = finalEmissiveIntensity;
        const initialEmissive = processColor.emissive ? processColor.emissive : (emissive === '#ffffff' ? '#000000' : emissive);
        materialRef.current.emissive.set(initialEmissive);
        materialRef.current.color.copy(originalColor);
      }
    }
  }, [processColor, blockOutlineTexture, pulse, emissiveIntensity, emissive, originalColor]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      if (!processColor.isEffect2 && !processColor.isEffect3 && !pulse) {
        return; // Skip doing this every frame if there's no animation!
      }
      
      const time = clock.elapsedTime;
      
      if (processColor.isEffect2) {
        // Sparkle / Magic effect
        const intensity = 0.5 + Math.sin(time * 8) * 0.5 + Math.sin(time * 12) * 0.5;
        materialRef.current.emissive.setHex(Math.random() > 0.5 ? 0xffffff : 0xffff00);
        materialRef.current.emissiveIntensity = intensity * 2;
        materialRef.current.color.setHex(0xaaaaaa);
      } else if (processColor.isEffect3 && processColor.map) {
        // Fire effect (scrolling texture)
        processColor.map.offset.y += 0.006;
        processColor.map.offset.x += Math.sin(time * 3) * 0.002;
      } else if (pulse) {
        // Pulse intensity 
        materialRef.current.emissiveIntensity = 0.6 + Math.sin(time * 5) * 0.4;
        
        // Sine wave mapped from 0 to 1 to interpolate between colors
        const lerpFactor = (Math.sin(time * 2.5) + 1) / 2;
        materialRef.current.emissive.lerpColors(limeColor, pinkColor, lerpFactor);
        
        // Temporarily darken base color so emissive dominates (crucial for white legs)
        materialRef.current.color.copy(darkBaseColor);
      }
    }
  });

  const handleBeforeCompile = (shader: any) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      #include <dithering_fragment>
      
      // Calculate original lighting intensity (includes all scene lights)
      float unlitLuma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
      float litLuma = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
      float intensity = litLuma / max(unlitLuma, 0.0001);
      
      
      // Dot scale: reduced by 2-3 times (higher multiplier makes grid smaller)
      vec2 coord = gl_FragCoord.xy * 2.5; 
      
      // Halftone pattern mapping from 0 to 1
      float pattern = (sin(coord.x) * sin(coord.y)) * 0.5 + 0.5;
      
      // Halftone Logic:
      // В глубокой тени (Light < 0.2) -> точки максимального размера
      // В полутени (0.2 < Light < 0.8) -> плавно уменьшаются
      // На свету (Light > 0.8) -> полностью исчезают
      
      // Artificial boost to ensure surfaces like floor plates facing lights stay clean white
      intensity = intensity * 1.5; 
      
      float dotSize = smoothstep(0.8, 0.2, intensity);
      
      // Restrict max dot size so they don't merge into solid black
      dotSize *= 0.65; 
      
      // Is current pixel inside a dot?
      float isDot = 1.0 - smoothstep(dotSize - 0.1, dotSize + 0.1, pattern);
      // Ensure dots completely fade out at threshold
      isDot *= smoothstep(0.0, 0.05, dotSize);
      
      // Gradient in shadows (Clamp):
      // Instead of going completely black, we clamp the shadow to 50% of the base color
      vec3 clampedShadowBase = max(diffuseColor.rgb * 0.5, gl_FragColor.rgb);
      
      // Pitch black dots
      vec3 dotColor = vec3(0.05); 
      
      // Final shaded comic color
      vec3 comicColor = mix(clampedShadowBase, dotColor, isDot);

      // Re-apply emissive
      gl_FragColor = vec4(comicColor + totalEmissiveRadiance, gl_FragColor.a);
      `
    );
  };

  return (
    <>
      <meshLambertMaterial 
        attach={attach}
        ref={materialRef}
        color={pulse ? '#222222' : processColor.color} 
        emissive={processColor.emissive || (emissive === '#ffffff' ? '#000000' : emissive)}
        emissiveIntensity={pulse ? 0.6 : (processColor.emissiveIntensity ?? emissiveIntensity)}
        transparent={transparent}
        opacity={opacity}
        map={hasBlockOutline ? blockOutlineTexture : (processColor.map || null)}
        onBeforeCompile={handleBeforeCompile}
      />
      {/* Outlines from drei occasionally crash with R3F 9 context, using internal shaders or inverted hulls is safer */}
    </>
  );
};


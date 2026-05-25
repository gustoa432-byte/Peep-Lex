import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { useVideoTexture } from '@react-three/drei';
import { useStore } from '../../store/useStore';
import { getMediaDB } from '../../lib/db';

const VideoTextureMesh = ({ url }: { url: string }) => {
  const texture = useVideoTexture(url, { loop: true, muted: true, start: true, crossOrigin: 'Anonymous' });
  return (
    <mesh position={[0, 4.0, 2.5]} scale={[-1, 1, 1]}>
      <cylinderGeometry args={[8, 8, 6.75, 64, 1, true, Math.PI - 0.75, 1.5]} />
      <meshBasicMaterial map={texture} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
};

export const BackgroundVideoProjector = ({ url }: { url: string }) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const safeCreateObjectURL = async (file: any, fileUrl: string) => {
        try {
            if (!(file instanceof Blob)) throw new Error("Invalid file type");
            return URL.createObjectURL(file);
        } catch (e) {
            useStore.getState().setBackgroundVideoUrl(null);
            useStore.getState().setBackgroundVideoFile(null);
            return null;
        }
    };

    const isBlob = url.startsWith('blob:');
    const isData = url.startsWith('data:');
    const isHttp = url.startsWith('http');
    const isLocalDB = !isBlob && !isData && !isHttp;

    if (isLocalDB) {
      let file = useStore.getState().backgroundVideoFile;
      if (file) {
         safeCreateObjectURL(file, url).then(objectUrl => { if (active && objectUrl) setResolvedUrl(objectUrl); });
      } else {
         getMediaDB(url).then(async dbFile => {
           if (!active) return;
           if (dbFile) {
             useStore.getState().setBackgroundVideoFile(dbFile as File);
             safeCreateObjectURL(dbFile, url).then(objectUrl => { if (active && objectUrl) setResolvedUrl(objectUrl); });
           } else {
             try {
               const { ApiService } = await import('../../services/ApiService');
               const publicUrl = await ApiService.getMediaPublicUrl('peep_media', url);
               if (publicUrl && active) {
                   setResolvedUrl(publicUrl);
               } else {
                   setResolvedUrl(null);
               }
             } catch(e) {
               if (active) setResolvedUrl(null);
             }
           }
         });
      }
    } else {
      setResolvedUrl(url);
    }
    return () => { active = false; };
  }, [url]);

  if (!resolvedUrl) return null;
  return <VideoTextureMesh url={resolvedUrl} />;
};

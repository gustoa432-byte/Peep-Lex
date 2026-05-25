import React, { useEffect, useState } from 'react';
import { AssetManager } from '../../managers/AssetManager';

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let unmounted = false;

    AssetManager.onProgress = (p) => {
      if (!unmounted) {
        setProgress(p);
      }
    };

    AssetManager.preload().then(() => {
      if (!unmounted) {
        onComplete();
      }
    });

    return () => {
      unmounted = true;
      AssetManager.onProgress = null;
    };
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-[100] bg-[#111216] flex flex-col items-center justify-center text-white">
      <div className="w-64 max-w-[80vw]">
        <h2 className="text-xl font-bold tracking-widest text-center mb-6 text-white/80">LOADING ASSETS</h2>
        
        {/* Progress Bar Container */}
        <div className="h-2 w-full bg-black/80 rounded-full overflow-hidden">
          {/* Progress fill */}
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
            style={{ width: `${Math.max(5, progress * 100)}%` }}
          />
        </div>
        
        <div className="mt-4 flex justify-between text-xs text-white/50 font-mono">
          <span>{Math.round(progress * 100)}%</span>
          <span>{AssetManager.loadedAssets}/{AssetManager.totalAssets}</span>
        </div>
      </div>
    </div>
  );
};

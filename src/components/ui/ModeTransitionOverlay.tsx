import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../store/useStore';

export const ModeTransitionOverlay: React.FC = () => {
  const transitionState = useStore(state => state.transitionState);
  const transitionTargetMode = useStore(state => state.transitionTargetMode);

  // We only render when transitionState is not idle
  if (transitionState === 'idle') return null;

  // Determine comic text based on target mode
  let comicText = 'BAM!';
  if (transitionTargetMode === 'room') comicText = 'CRAFT!';
  if (transitionTargetMode === 'editor') comicText = 'STYLE!';
  if (transitionTargetMode === 'roomEditor') comicText = 'BUILD!';
  if (transitionTargetMode === 'world') comicText = 'EXPLORE!';

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden isolate" style={{ perspective: '800px' }}>
      {/* Top angled panel */}
      <motion.div
        initial={{ y: '-100%', rotate: -5, scale: 1.2, x: '-5%' }}
        animate={transitionState === 'in' ? { y: '0%', rotate: -5, scale: 1.2, x: '-5%' } : { y: '-100%', rotate: -5, scale: 1.2, x: '-5%' }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 left-0 right-0 h-[60%] bg-white border-b-[12px] border-black shadow-[0_15px_0_0_rgba(0,0,0,1)] origin-bottom"
        style={{ paddingBottom: '10%' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-[#FFD700] via-[#FF8C00] to-[#E62020] opacity-100" />
        {/* Halftone dot pattern overlay */}
        <div className="absolute inset-0 opacity-30 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle, #000 3px, transparent 4px)', backgroundSize: '16px 16px' }} />
      </motion.div>

      {/* Bottom angled panel */}
      <motion.div
        initial={{ y: '100%', rotate: -5, scale: 1.2, x: '-5%' }}
        animate={transitionState === 'in' ? { y: '0%', rotate: -5, scale: 1.2, x: '-5%' } : { y: '100%', rotate: -5, scale: 1.2, x: '-5%' }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 left-0 right-0 h-[60%] bg-white border-t-[12px] border-black origin-top"
        style={{ paddingTop: '10%' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,_var(--tw-gradient-stops))] from-[#00F0FF] via-[#0055FF] to-[#000088] opacity-100" />
        {/* Halftone dot pattern overlay */}
        <div className="absolute inset-0 opacity-30 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle, #000 3px, transparent 4px)', backgroundSize: '16px 16px' }} />
      </motion.div>

      {/* Comic burst / Action Text */}
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -30, z: 100 }}
        animate={transitionState === 'in' ? { scale: 1, opacity: 1, rotate: [-30, 10, -5, 0], z: 100 } : { scale: 0, opacity: 0, rotate: 30, z: 100 }}
        transition={{ duration: 0.35, ease: 'backOut', delay: transitionState === 'in' ? 0.25 : 0 }}
        className="absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%] flex items-center justify-center filter drop-shadow-[0_15px_0_rgba(0,0,0,1)]"
      >
        <div className="relative flex items-center justify-center">
          {/* Yellow burst background */}
          <svg width="350" height="250" viewBox="0 0 350 250" className="absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%] w-[450px] h-[350px] -z-10 text-[#FFE600] fill-current">
             <path d="M175 10 L205 50 L265 20 L245 70 L305 80 L255 110 L295 160 L225 140 L195 190 L165 150 L105 180 L125 130 L65 120 L115 90 L55 40 L125 60 L145 10 Z" stroke="black" strokeWidth="12" strokeLinejoin="round" />
          </svg>
          <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter" style={{ WebkitTextStroke: '8px black', paintOrder: 'stroke fill' }}>{comicText}</h1>
        </div>
      </motion.div>
    </div>
  );
};

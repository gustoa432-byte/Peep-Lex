// A 1-second silent WAV file in base64
const silentWav = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

export const initKeepAlive = () => {
  let isKeepAliveStarted = false;
  
  const handleInteraction = () => {
    if (isKeepAliveStarted) return;
    isKeepAliveStarted = true;
    
    // 1. Возпроизведение тишины через HTML5 Audio (часто помогает от выгрузки вкладок на iOS/Android)
    try {
      const audio = new Audio(silentWav);
      audio.loop = true;
      audio.play().catch(e => console.warn('Silent audio keep-alive failed:', e));
    } catch (e) {
      console.warn('Audio keep-alive error:', e);
    }

    // 2. Web Audio API Ультразвук (20kHz, почти нулевая громкость) - как было запрошено
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // 20kHz - ультразвук, не слышим для людей
        osc.frequency.value = 20000;
        // Ставим очень низкую громкость, но не 0, чтобы браузер не оптимизировал и не обрезал
        gain.gain.value = 0.001; 
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
      }
    } catch (e) {
      console.warn('Web Audio ultrasound failed:', e);
    }

    // Убираем слушатели после инициализации
    document.removeEventListener('click', handleInteraction);
    document.removeEventListener('touchstart', handleInteraction);
    document.removeEventListener('keydown', handleInteraction);
  };

  // Ждем первого клика или тапа по экрану для запуска звука (браузеры требуют взаимодействия)
  document.addEventListener('click', handleInteraction);
  document.addEventListener('touchstart', handleInteraction, { passive: true });
  document.addEventListener('keydown', handleInteraction);
};

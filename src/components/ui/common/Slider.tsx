import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  showValue?: boolean;
  valueFormatter?: (val: number) => string;
  theme?: 'dark' | 'glass';
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange,
  showValue = false,
  valueFormatter = (v) => (v ?? 0).toFixed(2),
  theme = 'glass'
}) => {
  const isGlass = theme === 'glass';
  const safeValue = value ?? 0;

  return (
    <div className="flex flex-col gap-1 mb-1 opacity-85">
      <div className={`flex justify-between font-bold ${isGlass ? 'text-[11px] text-white [-webkit-text-stroke:0.25px_#f97316] drop-shadow-[0_0_4px_rgba(168,85,247,0.8)] uppercase tracking-wider' : 'text-gray-400 text-xs'}`}>
        <span>{label}</span>
        {showValue && (
          <span className="font-mono text-orange-500">{valueFormatter(safeValue)}</span>
        )}
      </div>
      <div className={isGlass ? "p-[0.5px] rounded-full bg-gradient-to-t from-orange-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]" : ""}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeValue}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onDoubleClick={() => onChange(0)}
          className={`w-full block m-0 appearance-none cursor-pointer rounded-full accent-orange-500 ${
            isGlass ? 'h-3 bg-gradient-to-t from-purple-500/60 to-black/40' : 'h-2 bg-gray-700'
          }`}
        />
      </div>
    </div>
  );
};

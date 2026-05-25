import React, { useEffect, useState } from 'react';
import { X, Music, Video as VideoIcon, Loader } from 'lucide-react';
import { ApiService } from '../../services/ApiService';

interface MediaLibraryModalProps {
  type: 'audio' | 'video';
  onClose: () => void;
  onSelect: (id: string | null) => void;
  currentUrl?: string | null;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({ type, onClose, onSelect, currentUrl }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ApiService.listMedia(type);
        if (data.length > 0 || (data.length === 0 && !error)) { // simple check, robust logic below
             setFiles(data);
        } else {
             // Handle empty correctly, but let's assume empty list is fine for now
             setFiles(data);
        }
      } catch (e) {
        setError('Не удалось подключиться к Storage');
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [type]);

  const handleSelect = (file: any) => {
     // Construct the path (e.g. "audio/track.mp3")
     onSelect(`${type}/${file.name}`);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[300] flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full border-[3px] border-black rounded-[24px] shadow-[0_8px_0_0_rgba(0,0,0,1)] p-6 pb-7 relative flex flex-col max-h-[80vh]">
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 w-12 h-12 bg-[#ff4b4b] border-[3px] border-black rounded-full flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:bg-red-400 active:translate-y-1 active:shadow-none transition-all z-10"
        >
          <X size={28} strokeWidth={4} className="text-white" />
        </button>

        <h3 className="text-2xl font-black text-black text-center mb-6 tracking-tight leading-none flex items-center justify-center gap-2">
          {type === 'audio' ? <Music className="text-[#06b6d4]" strokeWidth={3} size={28} /> : <VideoIcon className="text-[#a855f7]" strokeWidth={3} size={28} />}
          Библиотека {type === 'audio' ? 'Аудио' : 'Видео'}
        </h3>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[50vh]">
           {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-black/30 space-y-4 py-10 font-bold">
                 <Loader className="animate-spin" size={32} />
                 <p>Загрузка файлов...</p>
              </div>
           ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-[#ff4b4b] space-y-2 py-10 font-bold">
                 <p className="text-center">{error}</p>
                 <button onClick={onClose} className="px-4 py-2 mt-4 bg-black/5 rounded-[12px] hover:bg-black/10 text-black border-[3px] border-transparent">Назад</button>
              </div>
           ) : (
              <div className="space-y-3">
                {currentUrl && (
                  <button
                    onClick={() => onSelect(null)}
                    className="w-full bg-[#ff4b4b] border-[3px] border-black shadow-[0_3px_0_0_#000] active:translate-y-[3px] active:shadow-none rounded-[16px] p-4 flex items-center justify-between transition-all text-left mb-4"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-black/80 rounded-[12px] shrink-0 border-[2px] border-white/20">
                         <X size={20} className="text-white relative" strokeWidth={4} />
                      </div>
                      <div className="flex flex-col truncate text-white">
                        <span className="font-black text-lg leading-tight truncate">Отключить {type === 'audio' ? 'аудио' : 'видео'}</span>
                        <span className="text-[10px] uppercase font-bold text-white/80">Очистить текущий фон</span>
                      </div>
                    </div>
                  </button>
                )}
                {files.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-10 text-black/30 space-y-2 font-bold">
                     <p>Папка "{type}" совершенно пуста :/</p>
                     <p className="text-xs text-center px-4 max-w-[200px]">Загрузите файлы в бакет peep_media через Supabase</p>
                   </div>
                ) : (
                  files.map((file, idx) => {
                    const isSelected = currentUrl === `${type}/${file.name}`;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(file)}
                        className={`w-full border-[3px] border-black rounded-[16px] p-4 shadow-[0_3px_0_0_#000] active:translate-y-[3px] active:shadow-none flex items-center justify-between transition-all text-left ${isSelected ? 'bg-[#ff7a00] text-white' : 'bg-white hover:bg-gray-50 text-black'}`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden w-full">
                           <div className={`p-2 rounded-[12px] shrink-0 border-[2px] ${isSelected ? 'bg-black/80 border-white/20 text-white' : 'bg-black/5 border-transparent text-black/50'}`}>
                              {type === 'audio' ? <Music size={20} strokeWidth={isSelected ? 3 : 2} /> : <VideoIcon size={20} strokeWidth={isSelected ? 3 : 2} />}
                           </div>
                          <div className="flex flex-col truncate w-full pr-2">
                            <span className="font-black text-lg leading-tight truncate">{file.name}</span>
                            <span className={`text-[10px] uppercase font-bold ${(isSelected ? 'text-white/80' : 'text-black/50')}`}>
                               {file.metadata?.size ? `${(file.metadata.size / 1024 / 1024).toFixed(2)} MB ` : ''} 
                               {isSelected && "(ВЫБРАНО)"}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

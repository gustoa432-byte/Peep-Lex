import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ProfileService } from '../../services/ProfileService';
import { X, Check, Save } from 'lucide-react';

export const ProfileMenuOverlay = () => {
  const isProfileMenuOpen = useStore(state => state.isProfileMenuOpen);
  const setIsProfileMenuOpen = useStore(state => state.setIsProfileMenuOpen);
  const profile = useStore(state => state.profile);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  if (!isProfileMenuOpen) return null;

  const currentName = profile?.nickname || (!profile?.username || profile.username.startsWith("Guest_") ? "Peep" : profile.username);
  const changesUsed = profile?.free_name_changes_used || 0;
  const cost = changesUsed === 0 ? 0 : 100;

  const handleSaveName = () => {
    if (!newName.trim()) return;
    if (newName.trim() === currentName) {
      setIsEditingName(false);
      return;
    }
    const success = ProfileService.changeNickname(newName.trim());
    if (success) {
      setIsEditingName(false);
    } else {
      // Small visual feedback if we had a toast system, for now standard alert might be trapped by iframe, 
      // so let's just log it or rely on nothing. Let's rely on standard alert, or just do nothing.
      alert("Недостаточно пиастров для смены ника!");
    }
  };

  // Mock friends data
  const friends = [
    { id: '1', name: 'AlexTheGreat', status: 'online' },
    { id: '2', name: 'PeepMaster', status: 'in_party' },
    { id: '3', name: 'xXx_Peeper_xXx', status: 'offline' },
    { id: '4', name: 'Doge Coin', status: 'online' },
  ];

  return (
    <div className="absolute inset-0 bg-black/95 z-[200] pointer-events-auto flex justify-center items-center p-4">
      <div className="w-full max-w-sm bg-[#8b5cf6] border-[3px] border-black rounded-[32px] p-6 shadow-[0_4px_0_0_#000] relative">
        <button 
          onClick={() => setIsProfileMenuOpen(false)}
          className="absolute top-4 right-4 text-white hover:opacity-80 transition-opacity active:translate-y-1"
        >
          <X size={24} strokeWidth={3} />
        </button>

        <h2 className="text-xl font-black text-white mb-6 tracking-widest text-center uppercase drop-shadow-md">ПРОФИЛЬ</h2>

        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-[32px] border-[3px] border-black bg-gradient-to-tr from-[#ec4899] to-[#ff6b00] p-1 mb-4 shadow-[0_3px_0_0_#000]">
            <div className="w-full h-full bg-[#111] rounded-[26px] flex items-center justify-center">
              <span className="text-4xl font-black text-[#ff6b00] drop-shadow-sm">
                {currentName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {!isEditingName ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white drop-shadow-sm">{currentName}</span>
              <button 
                onClick={() => {
                  setNewName(currentName);
                  setIsEditingName(true);
                }}
                className="text-xs font-black uppercase text-black bg-[#ff6b00] border-[2px] border-black text-white hover:bg-[#e85d00] px-3 py-1.5 rounded-[12px] shadow-[0_2px_0_0_#000] transition-all active:translate-y-[2px] active:shadow-none"
              >
                Изменить
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex gap-2 w-full">
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={16}
                  className="w-full bg-[#a78bfa] border-[3px] border-black shadow-[inset_0_2px_0_0_rgba(0,0,0,0.2)] rounded-[16px] px-4 py-2 text-white font-black tracking-wide outline-none placeholder:text-white/60"
                  placeholder="Новый ник..."
                  autoFocus
                />
                <button 
                  onClick={handleSaveName}
                  className="bg-[#22c55e] border-[3px] border-black hover:bg-[#16a34a] text-white rounded-[16px] px-4 flex items-center justify-center transition-all shadow-[0_3px_0_0_#000] active:translate-y-[3px] active:shadow-none"
                >
                  <Save size={20} strokeWidth={3} />
                </button>
              </div>
              <div className="text-[10px] font-black text-white uppercase tracking-wider">
                {cost === 0 ? "Первая смена бесплатно" : `Стоимость: ${cost} PRS (У вас: ${profile?.prs || 0})`}
              </div>
            </div>
          )}
        </div>

        <div className="w-full">
          <h3 className="text-sm font-black text-[#cfb6ff] mb-4 tracking-widest uppercase">Друзья</h3>
          
          <div className="space-y-3 h-48 overflow-y-auto pr-2 custom-scrollbar">
            {friends.map(friend => (
              <div key={friend.id} className="flex items-center justify-between bg-[#a78bfa] border-[3px] border-black rounded-[20px] p-2 shadow-[0_3px_0_0_#000]">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#111] border-[2px] border-black flex items-center justify-center">
                      <span className="text-white font-black text-sm">{friend.name.charAt(0)}</span>
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-[2px] border-black ${
                      friend.status === 'online' ? 'bg-[#22c55e]' :
                      friend.status === 'in_party' ? 'bg-[#ff6b00]' : 'bg-[#6b7280]'
                    }`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-black text-sm">{friend.name}</span>
                    <span className="text-white/80 font-black text-[10px] tracking-wider uppercase">
                      {friend.status === 'online' ? 'В сети' :
                       friend.status === 'in_party' ? 'В пати' : 'Не в сети'}
                    </span>
                  </div>
                </div>

                {friend.status === 'online' && (
                  <button className="text-xs font-black uppercase bg-[#22c55e] border-[2px] border-black text-white hover:bg-[#16a34a] px-3 py-1.5 rounded-[12px] transition-all shadow-[0_2px_0_0_#000] active:translate-y-[2px] active:shadow-none">
                    ПАТИ
                  </button>
                )}
                {friend.status === 'in_party' && (
                  <button disabled className="text-xs font-black uppercase bg-[#6b7280] border-[2px] border-black text-white px-3 py-1.5 rounded-[12px]">
                    ЗАНЯТ
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

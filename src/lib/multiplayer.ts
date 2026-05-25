import { socket } from './socket';
import { useStore } from '../store/useStore';
import { FlexPack } from '../store/types';

export const shootSlingshot = (position: {x: number, y: number, z: number}, direction: {x: number, y: number, z: number}) => {
  socket.emit("shoot_slingshot", { position, direction });
};

export const broadcastFlex = async (packId: string) => {
  const state = useStore.getState();
  const pack = state.flexPacks.find(p => p.id === packId);
  const profile = state.profile;
  
  if (!pack || !profile) return;
  
  const payload = {
    id: pack.id,
    author_id: profile.id,
    author_name: profile.username,
    flex_json: JSON.stringify(pack),
    audio_id: pack.globalTrackUrl,
    video_id: pack.backgroundVideoUrl,
    timestamp: Date.now()
  };

  try {
    socket.emit("flex_broadcast", payload);
    console.log("Flex broadcasted via WebSocket!");
  } catch(err) {
    console.error("Failed to broadcast flex", err);
  }
};

export const subscribeToFlexBroadcasts = (onReceive: (pack: any, sender: any) => void) => {
  const handleReceive = (payload: any) => {
    console.log('Flex Received via WebSocket!', payload);
    onReceive(payload.flex_json, {
        id: payload.author_id,
        username: payload.author_name
    });
  };

  socket.on("flex_broadcast", handleReceive);
  
  return () => {
    socket.off("flex_broadcast", handleReceive);
  };
};

import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';
import { remoteState } from '../lib/multiplayerState';

class CoreMultiplayerService {
  private socket: Socket | null = null;
  private hasInitializedPhysics = false;

  init() {
    if (this.socket) return;
    
    this.socket = io();

    this.socket.on("connect", () => {
      console.log("Connected to multiplayer server:", this.socket?.id);
      const state = useStore.getState();
      if (state.appMode === 'world' || state.appMode === 'room') {
        this.joinRoom(state.appMode);
      }
    });

    const pushSnapshot = (player: any) => {
      let buffer = remoteState.playerBuffers.get(player.id);
      if (!buffer) {
        buffer = [];
        remoteState.playerBuffers.set(player.id, buffer);
      }
      buffer.push({
        t: performance.now(),
        position: { ...player.position },
        rotation: player.rotation,
        animation: player.animation,
      });
      
      // Keep only recent snapshots (last ~1 second at 20fps logic)
      if (buffer.length > 30) {
        buffer.splice(0, buffer.length - 30);
      }
    };

    this.socket.on("room_state", (players) => {
      players.forEach((p: any) => {
        remoteState.players.set(p.id, p);
        pushSnapshot(p);
      });
      useStore.getState().setOtherPlayers(players);
    });

    this.socket.on("player_joined", (player) => {
      remoteState.players.set(player.id, player);
      pushSnapshot(player);
      useStore.getState().addOtherPlayer(player);
    });

    this.socket.on("player_left", (playerId) => {
      remoteState.players.delete(playerId);
      remoteState.playerBuffers.delete(playerId);
      useStore.getState().removeOtherPlayer(playerId);
    });

    this.socket.on("player_moved", (player) => {
      // Only update mutable map
      const existing = remoteState.players.get(player.id);
      if (existing) {
        remoteState.players.set(player.id, { ...existing, ...player });
      } else {
        remoteState.players.set(player.id, player);
      }
      pushSnapshot(remoteState.players.get(player.id));
    });

    this.socket.on("physics_full_state", (objects) => {
      objects.forEach((obj: any) => remoteState.physics.set(obj.id, obj));
      useStore.getState().setPhysicsObjects(objects);
      this.hasInitializedPhysics = true;
    });

    this.socket.on("physics_state", (objects) => {
      objects.forEach((obj: any) => remoteState.physics.set(obj.id, obj));
      
      // Fallback if full state didn't arrive first
      if (!this.hasInitializedPhysics && objects.length > 0) {
        useStore.getState().setPhysicsObjects(Array.from(remoteState.physics.values()));
        this.hasInitializedPhysics = true;
      }
    });
  }

  joinRoom(roomName: string) {
    if (!this.socket) return;
    
    // Clear old state from previous room
    remoteState.players.clear();
    remoteState.physics.clear();
    useStore.getState().setPhysicsObjects([]);
    this.hasInitializedPhysics = false;

    const config = useStore.getState().characterConfig;
    if (this.socket.connected) {
      this.socket.emit("join_room", { roomName, config });
    }
  }

  sendPlayerState(state: any) {
    if (this.socket?.connected) {
      this.socket.emit("player_state", state);
    }
  }
}

export const MultiplayerService = new CoreMultiplayerService();

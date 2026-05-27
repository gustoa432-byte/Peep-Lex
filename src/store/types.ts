export type TabType = 'body' | 'colors' | 'accessories' | 'effects' | 'decal';
export type BodyPartType = 'head' | 'torso' | 'arms' | 'legs' | null;

export interface DevSettings {
  cameraDistance: number;
  cameraHeight: number;
  cameraPitch: number;

  roomCameraDistance?: number;
  roomCameraHeight?: number;
  roomCameraPitch?: number;

  worldCameraDistance?: number;
  worldCameraHeight?: number;
  worldCameraPitch?: number;
  
  rootPositionY: number; // For Vertical Jumping / Squatting
  rootPositionX: number; // For Horizontal Moving
  rootPositionZ: number; // For Forward/Backward Moving
  rootRotationY: number; // For Horizontal Spinning

  spineAngleX: number;
  spineAngleY: number;
  spineAngleZ: number;
  neckAngleX: number;
  neckAngleY: number;
  neckAngleZ: number;
  leftShoulderAngleX: number;
  leftShoulderAngleY: number;
  leftShoulderAngleZ: number;
  rightShoulderAngleX: number;
  rightShoulderAngleY: number;
  rightShoulderAngleZ: number;
  leftElbowAngleX: number;
  leftElbowAngleY: number;
  leftElbowAngleZ: number;
  rightElbowAngleX: number;
  rightElbowAngleY: number;
  rightElbowAngleZ: number;
  leftHipAngleX: number;
  leftHipAngleY: number;
  leftHipAngleZ: number;
  rightHipAngleX: number;
  rightHipAngleY: number;
  rightHipAngleZ: number;
  leftKneeAngleX: number;
  leftKneeAngleY: number;
  leftKneeAngleZ: number;
  rightKneeAngleX: number;
  rightKneeAngleY: number;
  rightKneeAngleZ: number;

  // Wrists
  leftWristAngleX: number;
  leftWristAngleY: number;
  leftWristAngleZ: number;
  rightWristAngleX: number;
  rightWristAngleY: number;
  rightWristAngleZ: number;

  // Light Settings
  spotLightPosX: number;
  spotLightPosY: number;
  spotLightPosZ: number;
  spotLightAngle: number;
  spotLightPenumbra: number;
  spotLightIntensity: number;

  rimPinkPosX: number;
  rimPinkPosY: number;
  rimPinkPosZ: number;
  rimPinkIntensity: number;

  rimCyanPosX: number;
  rimCyanPosY: number;
  rimCyanPosZ: number;
  rimCyanIntensity: number;

  backFillPosX: number;
  backFillPosY: number;
  backFillPosZ: number;
  backFillIntensity: number;

  ambientIntensity: number;

  ambientMode?: number;
  rimPinkMode?: number;
  rimCyanMode?: number;
  spotMode?: number;

  // Effects & Emotions
  emotion?: 'smile' | 'sad' | 'angry' | 'surprised' | 'cool' | 'xd';
  effectHalo?: boolean;
  effectSkull?: boolean;
  effectGlitch?: boolean;
  effectHearts?: boolean;
  effectSparkles?: boolean;
}

export interface CharacterConfig {
  mainColor: string;
  legColor: string;
  headColor?: string;
  torsoColor?: string;
  leftShoulderColor?: string;
  leftElbowColor?: string;
  leftHandColor?: string;
  rightShoulderColor?: string;
  rightElbowColor?: string;
  rightHandColor?: string;
  leftHipColor?: string;
  leftKneeColor?: string;
  leftShoeColor?: string;
  rightHipColor?: string;
  rightKneeColor?: string;
  rightShoeColor?: string;
  headSize: number;
  torsoRadius: number;
  torsoLength: number;
  armLength: number;
  armThickness: number;
  legLength: number;
  legThickness: number;
  shoulderSpread: number;
  hipSpread: number;
  headAccessory?: string;
  decalText?: string;
  decalColor?: string;
  decalScale?: number;
  decalYFront?: number;
  decalYBack?: number;
  decalFrontVisible?: boolean;
  decalBackVisible?: boolean;
}

export interface AnimationLoop {
  id: string;
  name: string;
  frames: DevSettings[];
  speed: number;
  delayAfter: number;
  trackStartTime?: number; // Starting bound in track
  globalTrackUrl?: string | null;
  backgroundVideoUrl?: string | null;
  // Note: File objects cannot be reliably persisted to localStorage, 
  // but we can preserve the references for the current session.
  globalTrackFile?: File | null;
  backgroundVideoFile?: File | null;
}

export interface UserProfile {
  id: string; // Auth DB ID or local device ID
  username: string; // Telegram or default username
  nickname?: string; // Custom nickname
  free_name_changes_used?: number;
  status?: 'online' | 'offline' | 'in_party';
  friends?: string[]; // Array of friend IDs
  ponts: number; // Soft currency
  prs: number; // Hard currency for telegram stars
  last_claim_time: number; // timestamp
  unlockedGradients?: string[];
  unlockedPrints?: string[];
}

export type AppMode = 'editor' | 'world' | 'parkour' | 'room' | 'roomEditor';

export interface RoomObject {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export type RoomEditorMode = 'build' | 'view' | 'move' | 'voxel';
export type RoomEditorTool = 'stamp' | 'eraser';

export interface FlexPack {
  id: string;
  name: string;
  loops: AnimationLoop[];
  globalTrackUrl?: string | null;
  backgroundVideoUrl?: string | null;
  createdAt: number;
}

export interface PlayerState {
  id: string;
  position: { x: number, y: number, z: number };
  rotation: number;
  room: string;
  animation?: any;
  config?: Partial<CharacterConfig>;
}

export interface AppState {
  // Multiplayer
  otherPlayers: PlayerState[];
  setOtherPlayers: (players: PlayerState[]) => void;
  addOtherPlayer: (player: PlayerState) => void;
  removeOtherPlayer: (id: string) => void;
  updateOtherPlayer: (player: PlayerState) => void;

  // Physics sync
  physicsObjects: any[];
  setPhysicsObjects: (objects: any[]) => void;
  
  isOnPodium: boolean;
  setIsOnPodium: (val: boolean) => void;

  // App Mode
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;

  // Economy & Profile
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  updateLocalPonts: (amount: number) => void;
  updateLocalPrs: (amount: number) => void;

  // Movement / Camera
  cameraSpeed: number;
  setCameraSpeed: (speed: number) => void;
  isCrouching: boolean;
  toggleCrouch: () => void;
  jumpTrigger: number;
  triggerJump: () => void;

  // Customization UI State
  isBodyEditorOpen: boolean;
  setIsBodyEditorOpen: (val: boolean) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedColorPart: string;
  setSelectedColorPart: (part: string) => void;
  activeBodyPart: BodyPartType;
  setActiveBodyPart: (part: BodyPartType) => void;

  // Character Data
  characterConfig: CharacterConfig;
  updateCharacterConfig: (config: Partial<CharacterConfig>) => void;

  // Dev Settings
  isAnimationMenuOpen: boolean;
  setIsAnimationMenuOpen: (val: boolean) => void;
  isProfileMenuOpen: boolean;
  setIsProfileMenuOpen: (val: boolean) => void;
  devSettings: DevSettings;
  updateDevSettings: (settings: Partial<DevSettings>, skipKeyframeUpdate?: boolean) => void;

  isDevUiOpen: boolean;
  setIsDevUiOpen: (val: boolean) => void;

  isUiHidden: boolean;
  setIsUiHidden: (val: boolean) => void;
  showStats: boolean;
  setShowStats: (val: boolean) => void;

  isFirstPerson: boolean;
  setIsFirstPerson: (val: boolean) => void;
  hasSlingshot: boolean;
  setHasSlingshot: (val: boolean) => void;
  isNearSlingshot: boolean;
  setIsNearSlingshot: (val: boolean) => void;

  activeBoneName: string | null;
  setActiveBoneName: (val: string | null) => void;
  activePoseSection: 'head' | 'torso' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg' | 'effects' | 'movement' | null;
  setActivePoseSection: (val: 'head' | 'torso' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg' | 'effects' | 'movement' | null) => void;
  isTwistMode: boolean;
  setIsTwistMode: (val: boolean) => void;

  hasInteractedJoystick: boolean;
  setHasInteractedJoystick: (val: boolean) => void;

  history: DevSettings[];
  historyIndex: number;
  pushHistory: (state: DevSettings) => void;
  undoHistory: () => void;
  redoHistory: () => void;

  // Media
  backgroundVideoUrl: string | null;
  setBackgroundVideoUrl: (url: string | null) => void;
  backgroundVideoFile: File | null;
  setBackgroundVideoFile: (file: File | null) => void;

  bgSphereY: number;
  setBgSphereY: (val: number) => void;
  bgSphereRotY: number;
  setBgSphereRotY: (val: number) => void;

  // --- Environment Settings ---
  environmentTime: 'day' | 'night' | 'dusk';
  setEnvironmentTime: (time: 'day' | 'night' | 'dusk') => void;
  environmentTerrain: 'concrete' | 'grass' | 'dirt';
  setEnvironmentTerrain: (terrain: 'concrete' | 'grass' | 'dirt') => void;

  // --- Room Editor ---
  roomEditorMode: RoomEditorMode;
  setRoomEditorMode: (mode: RoomEditorMode) => void;

  isErasing: boolean;
  setIsErasing: (val: boolean) => void;
  isBuildingActive: boolean;
  setIsBuildingActive: (val: boolean) => void;

  roomObjects: RoomObject[];
  setRoomObjects: (objects: RoomObject[]) => void;

  roomChunks: Record<string, RoomObject[]>;
  setRoomChunks: (chunks: Record<string, RoomObject[]>) => void;

  roomEditorHistory: RoomObject[][];
  roomEditorHistoryIndex: number;
  roomCameraResetTrigger: number;
  triggerRoomCameraReset: () => void;
  macroCameraState: { position: [number, number, number], target: [number, number, number] } | null;
  setMacroCameraState: (state: { position: [number, number, number], target: [number, number, number] } | null) => void;
  commitRoomEditorHistory: () => void;
  pushRoomEditorHistory: (objects: RoomObject[]) => void;
  undoRoomEditorHistory: () => void;
  redoRoomEditorHistory: () => void;

  roomSelectedTool: RoomEditorTool;
  setRoomSelectedTool: (tool: RoomEditorTool) => void;

  roomSelectedStamp: string;
  setRoomSelectedStamp: (stamp: string) => void;

  roomBlockSize: number;
  setRoomBlockSize: (size: number) => void;

  buildLayer: number;
  setBuildLayer: (layer: number) => void;

  brushShape: 'rect' | 'line' | 'point' | 'stairs' | 'roof' | 'box';
  setBrushShape: (shape: 'rect' | 'line' | 'point' | 'stairs' | 'roof' | 'box') => void;

  brushHeight: number;
  setBrushHeight: (height: number) => void;

  podiumPosition: [number, number, number];
  setPodiumPosition: (pos: [number, number, number]) => void;

  // Audio timings
  globalTrackStartTime: number;
  setGlobalTrackStartTime: (val: number) => void;
  trackDuration: number;
  setTrackDuration: (val: number) => void;
  currentLoopStartTime: number;
  setCurrentLoopStartTime: (val: number) => void;
  updateLoopStartTime: (id: string, startTime: number) => void;
  
  // BPM
  trackBPM: number;
  setTrackBPM: (val: number) => void;

  // Animation Editor
  keyframes: DevSettings[];
  selectedKeyframeIndex: number | null;
  setSelectedKeyframeIndex: (val: number | null) => void;
  addKeyframe: (pose: DevSettings) => void;
  updateKeyframe: (index: number, updates: Partial<DevSettings>) => void;
  removeKeyframe: (index: number) => void;
  clearKeyframes: (initialPose?: Partial<DevSettings>) => void;
  isPlayingAnimation: boolean;
  setIsPlayingAnimation: (val: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (val: number) => void;

  // Loops / Layers
  loops: AnimationLoop[];
  flexPacks: FlexPack[];
  editingLoopId: string | null;
  setEditingLoopId: (id: string | null) => void;
  loadLoopForEditing: (id: string) => void;
  saveLoop: (name: string, delayAfter: number, replaceId?: string) => void;
  removeLoop: (id: string) => void;
  duplicateLoop: (id: string) => void;
  saveFlexPack: (name: string, forcedId?: string) => void;
  loadFlexPack: (id: string) => void;
  removeFlexPack: (id: string) => void;
  isPlayingLoops: boolean;
  setIsPlayingLoops: (val: boolean) => void;
  isPlayingLoopsOnce: boolean;
  setIsPlayingLoopsOnce: (val: boolean) => void;
  isPaused: boolean;
  setIsPaused: (val: boolean) => void;
  audioScrubTrigger: number;
  triggerAudioScrub: () => void;
  updateLoopDelay: (id: string, delay: number) => void;

  globalTrackUrl: string | null;
  setGlobalTrackUrl: (url: string | null) => void;
  globalTrackFile: File | null;
  setGlobalTrackFile: (file: File | null) => void;
}

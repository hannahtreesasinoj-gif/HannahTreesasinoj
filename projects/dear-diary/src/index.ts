export type MoodType = 
  | 'happy' 
  | 'excited' 
  | 'calm' 
  | 'neutral' 
  | 'sad' 
  | 'angry' 
  | 'worried' 
  | 'celebrating' 
  | 'tired' 
  | 'loved'
  | string; // Allows custom moods

export interface MoodConfig {
  id: MoodType;
  label: string;
  emoji: string;
  color: string;
  bgLight: string;
}

export type ThemeName = 
  | 'minimal'
  | 'sunset'
  | 'ocean'
  | 'forest'
  | 'lavender'
  | 'pastel'
  | 'vintage'
  | 'notebook'
  | 'midnight'
  | 'dark'
  | 'seasonal'
  | 'colorful';

export type FontChoice = 'sans' | 'serif' | 'handwriting' | 'mono' | 'cursive';

export interface UserSettings {
  id?: number;
  userName: string;
  theme: ThemeName;
  fontChoice: FontChoice;
  fontSize: 'small' | 'medium' | 'large';
  autoLockMinutes: number; // 0 = immediately, 0.5 = 30s, 1 = 1m, 5, 15, -1 = never
  hasPin: boolean;
  pinHash?: string;
  pinSalt?: string;
  hasBiometrics: boolean;
  dailyPromptsEnabled: boolean;
  onboardingCompleted: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
}

export interface MediaAttachment {
  id: string;
  entryId?: string;
  type: 'image' | 'video' | 'audio';
  name: string;
  mimeType: string;
  dataUrl: string; // Base64 or Blob URL for local offline playback
  thumbnailDataUrl?: string;
  duration?: number; // For audio/video in seconds
  size: number;
  isVault: boolean;
  isFavorite: boolean;
  createdAt: string;
}

export interface ScrapbookItem {
  id: string;
  type: 'photo' | 'sticker' | 'washi' | 'text' | 'polaroid' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  content: string; // image url, sticker emoji/svg, text string, shape type
  caption?: string; // for polaroids
  color?: string;
  fontFamily?: string;
}

export interface ScrapbookPage {
  id: string;
  backgroundPattern: 'dots' | 'grid' | 'parchment' | 'lined' | 'pastel-gradient' | 'none';
  backgroundColor: string;
  items: ScrapbookItem[];
  previewDataUrl?: string;
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string; // Rich HTML or Markdown
  plainText: string; // Stripped text for search & insights
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mood: MoodType;
  tags: string[];
  category: string;
  media: MediaAttachment[];
  drawingDataUrl?: string; // Output from handwriting/drawing canvas
  scrapbookPage?: ScrapbookPage;
  isArchived: boolean;
  isFavorite: boolean;
  isVault: boolean; // Locked in secure vault
  isDream?: boolean;
  dreamData?: {
    lucidity: number; // 1-5
    dreamType: 'vivid' | 'lucid' | 'nightmare' | 'recurring' | 'normal';
    interpretationNote?: string;
  };
  reflectionNote?: string; // For "On This Day" reflections
  reflectionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeCapsule {
  id: string;
  entryId: string;
  title: string;
  messagePreview: string;
  sealDate: string;
  unlockDate: string;
  isUnlocked: boolean;
  revealedAt?: string;
  themeStyle: 'classic' | 'celestial' | 'antique' | 'futuristic';
  createdAt: string;
}

export interface FutureLetter {
  id: string;
  recipientTitle: string; // e.g. "To Me on Graduation Day"
  deliverDate: string; // YYYY-MM-DD
  title: string;
  content: string;
  stamp: string; // emoji or stamp name
  envelopeColor: string;
  isOpened: boolean;
  openedAt?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number; // 0 to 100
  isCompleted: boolean;
  linkedEntryIds: string[];
  createdAt: string;
  completedAt?: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  icon: string;
  description: string;
  category: 'writing' | 'streak' | 'creative' | 'memory' | 'security';
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface PromptItem {
  id: string;
  category: 'Reflection' | 'Gratitude' | 'Growth' | 'Memories' | 'Creativity';
  prompt: string;
  icon: string;
}

import type { MoodConfig, MoodType } from '../types';

export const MOODS: MoodConfig[] = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: '#10b981', bgLight: 'rgba(16, 185, 129, 0.15)' },
  { id: 'excited', label: 'Excited', emoji: '😍', color: '#f59e0b', bgLight: 'rgba(245, 158, 11, 0.15)' },
  { id: 'calm', label: 'Calm', emoji: '😌', color: '#06b6d4', bgLight: 'rgba(6, 182, 212, 0.15)' },
  { id: 'neutral', label: 'Neutral', emoji: '😐', color: '#6b7280', bgLight: 'rgba(107, 114, 128, 0.15)' },
  { id: 'sad', label: 'Sad', emoji: '😔', color: '#6366f1', bgLight: 'rgba(99, 102, 241, 0.15)' },
  { id: 'angry', label: 'Angry', emoji: '😡', color: '#ef4444', bgLight: 'rgba(239, 68, 68, 0.15)' },
  { id: 'worried', label: 'Worried', emoji: '😰', color: '#8b5cf6', bgLight: 'rgba(139, 92, 246, 0.15)' },
  { id: 'celebrating', label: 'Celebrating', emoji: '🥳', color: '#ec4899', bgLight: 'rgba(236, 72, 153, 0.15)' },
  { id: 'tired', label: 'Tired', emoji: '😴', color: '#64748b', bgLight: 'rgba(100, 116, 139, 0.15)' },
  { id: 'loved', label: 'Loved', emoji: '❤️', color: '#f43f5e', bgLight: 'rgba(244, 63, 94, 0.15)' }
];

export function getMoodDetails(moodId: MoodType): MoodConfig {
  const found = MOODS.find(m => m.id === moodId);
  if (found) return found;
  return {
    id: moodId,
    label: moodId,
    emoji: '✨',
    color: '#8b5cf6',
    bgLight: 'rgba(139, 92, 246, 0.15)'
  };
}

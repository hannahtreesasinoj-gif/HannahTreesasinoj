import Dexie, { type Table } from 'dexie';
import type { 
  DiaryEntry, 
  MediaAttachment, 
  TimeCapsule, 
  FutureLetter, 
  Goal, 
  Achievement, 
  UserSettings 
} from '../types';

export class DearDiaryDatabase extends Dexie {
  entries!: Table<DiaryEntry, string>;
  media!: Table<MediaAttachment, string>;
  timeCapsules!: Table<TimeCapsule, string>;
  futureLetters!: Table<FutureLetter, string>;
  goals!: Table<Goal, string>;
  achievements!: Table<Achievement, string>;
  settings!: Table<UserSettings, number>;

  constructor() {
    super('DearDiaryLocalDB');
    this.version(1).stores({
      entries: 'id, date, mood, category, isArchived, isFavorite, isVault, isDream, createdAt',
      media: 'id, entryId, type, isVault, isFavorite, createdAt',
      timeCapsules: 'id, entryId, unlockDate, isUnlocked, createdAt',
      futureLetters: 'id, deliverDate, isOpened, createdAt',
      goals: 'id, targetDate, isCompleted, createdAt',
      achievements: 'id, code, isUnlocked, category',
      settings: '++id'
    });
  }
}

export const db = new DearDiaryDatabase();

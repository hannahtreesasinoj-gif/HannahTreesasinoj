import { db } from '../db/db';
import confetti from 'canvas-confetti';

export class AchievementService {
  /**
   * Evaluates all local achievement criteria and unlocks earned badges.
   */
  static async checkAndUnlockAchievements(): Promise<string[]> {
    const newlyUnlocked: string[] = [];
    const entries = await db.entries.toArray();
    const settings = await db.settings.toCollection().first();
    const capsules = await db.timeCapsules.count();
    const letters = await db.futureLetters.count();
    const achievements = await db.achievements.toArray();

    const entryCount = entries.length;
    const hasVoice = entries.some(e => e.media && e.media.some(m => m.type === 'audio'));
    const hasPhoto = entries.some(e => e.media && e.media.some(m => m.type === 'image'));
    const hasDraw = entries.some(e => Boolean(e.drawingDataUrl));
    const hasScrapbook = entries.some(e => Boolean(e.scrapbookPage));
    const hasDream = entries.some(e => Boolean(e.isDream));
    const hasSecurity = Boolean(settings?.hasPin);

    // Calculate streak
    const dates = Array.from(new Set(entries.map(e => e.date))).sort();
    let currentStreak = 0;
    if (dates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (dates.includes(today) || dates.includes(yesterday)) {
        currentStreak = 1;
        let checkDate = new Date(dates[dates.length - 1]);
        for (let i = dates.length - 2; i >= 0; i--) {
          const prevDate = new Date(dates[i]);
          const diffDays = Math.round((checkDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) {
            currentStreak++;
            checkDate = prevDate;
          } else {
            break;
          }
        }
      }
    }

    const unlockMap: Record<string, boolean> = {
      first_entry: entryCount >= 1,
      streak_3: currentStreak >= 3,
      streak_7: currentStreak >= 7,
      entries_10: entryCount >= 10,
      entries_50: entryCount >= 50,
      entries_100: entryCount >= 100,
      first_voice: hasVoice,
      first_photo: hasPhoto,
      first_draw: hasDraw,
      first_scrapbook: hasScrapbook,
      first_capsule: capsules >= 1,
      first_letter: letters >= 1,
      first_dream: hasDream,
      security_vault: hasSecurity
    };

    for (const ach of achievements) {
      if (!ach.isUnlocked && unlockMap[ach.code]) {
        await db.achievements.update(ach.id, {
          isUnlocked: true,
          unlockedAt: new Date().toISOString()
        });
        newlyUnlocked.push(ach.title);
      }
    }

    if (newlyUnlocked.length > 0) {
      // Fire confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // silent fallback
      }
    }

    return newlyUnlocked;
  }
}

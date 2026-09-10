import { db } from './db';
import type { Achievement, DiaryEntry, PromptItem, UserSettings } from '../types';

export const DEFAULT_PROMPTS: PromptItem[] = [
  { id: 'p1', category: 'Reflection', prompt: 'What made today meaningful or gave you pause?', icon: '✨' },
  { id: 'p2', category: 'Reflection', prompt: 'What is one moment from today you want to preserve forever?', icon: '🕰️' },
  { id: 'p3', category: 'Gratitude', prompt: 'What are three small everyday things you are thankful for right now?', icon: '🌿' },
  { id: 'p4', category: 'Gratitude', prompt: 'Who brought a smile to your face today and why?', icon: '💛' },
  { id: 'p5', category: 'Growth', prompt: 'What did you learn today, either about yourself or the world?', icon: '🌱' },
  { id: 'p6', category: 'Growth', prompt: 'What was a small challenge you faced today, and how did you handle it?', icon: '⛰️' },
  { id: 'p7', category: 'Memories', prompt: 'Describe a comforting sound, aroma, or view from today.', icon: '☕' },
  { id: 'p8', category: 'Memories', prompt: 'What memory from your past surfaced unexpectedly today?', icon: '📸' },
  { id: 'p9', category: 'Creativity', prompt: 'If today were a song or a movie, what would its title and soundtrack be?', icon: '🎬' },
  { id: 'p10', category: 'Creativity', prompt: 'Write a quick 4-line poem capturing the mood of this evening.', icon: '🎨' },
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', code: 'first_entry', title: 'First Entry', icon: '🌱', description: 'Wrote your very first diary entry.', category: 'writing', isUnlocked: true, unlockedAt: new Date().toISOString() },
  { id: 'a2', code: 'streak_3', title: '3-Day Rhythm', icon: '🌿', description: 'Wrote entries 3 days in a row.', category: 'streak', isUnlocked: false },
  { id: 'a3', code: 'streak_7', title: '7-Day Journal', icon: '🔥', description: 'Maintained a full 7-day journaling streak.', category: 'streak', isUnlocked: false },
  { id: 'a4', code: 'entries_10', title: 'Storyteller', icon: '📖', description: 'Penned 10 thoughtful memories.', category: 'writing', isUnlocked: false },
  { id: 'a5', code: 'entries_50', title: 'Chronicle Master', icon: '📚', description: 'Recorded 50 diary entries.', category: 'writing', isUnlocked: false },
  { id: 'a6', code: 'entries_100', title: 'Century of Thoughts', icon: '💯', description: 'Reached 100 entries in your private vault.', category: 'writing', isUnlocked: false },
  { id: 'a7', code: 'first_voice', title: 'Voice Memory', icon: '🎙️', description: 'Recorded and saved your first voice entry.', category: 'creative', isUnlocked: false },
  { id: 'a8', code: 'first_photo', title: 'Visual Memory', icon: '📸', description: 'Attached your first photograph to a memory.', category: 'creative', isUnlocked: false },
  { id: 'a9', code: 'first_draw', title: 'Creative Artist', icon: '🎨', description: 'Created a hand-drawn sketch or doodle.', category: 'creative', isUnlocked: false },
  { id: 'a10', code: 'first_scrapbook', title: 'Scrapbook Crafter', icon: '✂️', description: 'Designed your first multi-element scrapbook page.', category: 'creative', isUnlocked: false },
  { id: 'a11', code: 'first_capsule', title: 'Time Traveler', icon: '⏳', description: 'Sealed a memory inside a future Time Capsule.', category: 'memory', isUnlocked: false },
  { id: 'a12', code: 'first_letter', title: 'Dear Future Me', icon: '💌', description: 'Sent a letter to your future self in the mailbox.', category: 'memory', isUnlocked: false },
  { id: 'a13', code: 'first_dream', title: 'Dream Weaver', icon: '🌙', description: 'Logged a dream in your dream journal.', category: 'memory', isUnlocked: false },
  { id: 'a14', code: 'security_vault', title: 'Fort Knox', icon: '🔒', description: 'Secured your diary with a PIN or Password.', category: 'security', isUnlocked: false },
];

export const DEFAULT_CATEGORIES = [
  'Personal',
  'College',
  'Travel',
  'Family',
  'Friends',
  'Goals',
  'Ideas',
  'Memories',
  'Dreams',
  'Study'
];

export const DEFAULT_TAGS = [
  'reflection',
  'gratitude',
  'friends',
  'travel',
  'study',
  'goals',
  'memories',
  'inspiration',
  'daily'
];

export async function initializeDatabase(): Promise<void> {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    const defaultSettings: UserSettings = {
      userName: 'Friend',
      theme: 'sunset',
      fontChoice: 'serif',
      fontSize: 'medium',
      autoLockMinutes: -1, // Never by default until configured
      hasPin: false,
      hasBiometrics: false,
      dailyPromptsEnabled: true,
      onboardingCompleted: false,
      soundEffects: true,
      hapticFeedback: true,
    };
    await db.settings.add(defaultSettings);
  }

  const achievementCount = await db.achievements.count();
  if (achievementCount === 0) {
    await db.achievements.bulkAdd(DEFAULT_ACHIEVEMENTS);
  }

  // Check if we need to add a welcoming starter entry
  const entryCount = await db.entries.count();
  if (entryCount === 0) {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toTimeString().slice(0, 5);

    const welcomeEntry: DiaryEntry = {
      id: 'welcome-entry-1',
      title: 'Welcome to Dear Diary 📖',
      content: `<h2>Your memories. Your thoughts. Your story.</h2>
<p>Dear Diary is your <strong>private sanctuary</strong>. Everything you write, record, draw, and save lives <em>entirely on this device</em> without internet requirements or external servers.</p>
<p>Here are a few things you can explore:</p>
<ul>
  <li><strong>✍️ Rich Text Writing:</strong> Use formatting, quotes, headings, and custom fonts.</li>
  <li><strong>🎨 Creative Scrapbook & Drawing:</strong> Add polaroid frames, washi tape, cute stickers, and freehand doodles.</li>
  <li><strong>🎙️ Voice Memories:</strong> Record your thoughts with our built-in offline audio studio.</li>
  <li><strong>⏳ Time Capsules & Future Mail:</strong> Seal letters to open on future milestones.</li>
  <li><strong>🔒 Security & Media Vault:</strong> Protect secret entries and photos behind your private PIN.</li>
</ul>
<p><em>Take a breath, make a cup of tea, and make this space your own. Happy journaling!</em> ✨</p>`,
      plainText: "Welcome to Dear Diary! Your private sanctuary. Everything you write, record, draw, and save lives entirely on this device.",
      date: dateStr,
      time: timeStr,
      mood: 'calm',
      tags: ['memories', 'inspiration', 'daily'],
      category: 'Personal',
      media: [],
      isArchived: false,
      isFavorite: true,
      isVault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.entries.add(welcomeEntry);
  }
}

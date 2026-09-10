import { db } from '../db/db';
import type { DiaryEntry, UserSettings, TimeCapsule, FutureLetter, Goal } from '../types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

export interface BackupPackage {
  version: string;
  exportDate: string;
  app: string;
  settings?: UserSettings;
  entries: DiaryEntry[];
  timeCapsules?: TimeCapsule[];
  futureLetters?: FutureLetter[];
  goals?: Goal[];
}

export class BackupService {
  /**
   * Generates a complete JSON backup of all diary data.
   */
  static async exportJsonBackup(): Promise<void> {
    const entries = await db.entries.toArray();
    const settings = await db.settings.toCollection().first();
    const timeCapsules = await db.timeCapsules.toArray();
    const futureLetters = await db.futureLetters.toArray();
    const goals = await db.goals.toArray();

    const backup: BackupPackage = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      app: 'Dear Diary (Offline-First)',
      settings,
      entries,
      timeCapsules,
      futureLetters,
      goals
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    saveAs(blob, `dear_diary_backup_${new Date().toISOString().split('T')[0]}.json`);
  }

  /**
   * Exports an entry as plain text (.txt)
   */
  static exportEntryAsTxt(entry: DiaryEntry): void {
    const textContent = `=========================================
DEAR DIARY MEMORY
Date: ${entry.date} at ${entry.time}
Mood: ${entry.mood}
Category: ${entry.category}
Tags: ${entry.tags.map(t => '#' + t).join(' ')}
=========================================

TITLE: ${entry.title}

${entry.plainText || entry.content.replace(/<[^>]*>?/gm, '')}

=========================================
Saved securely in Dear Diary.
`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${entry.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${entry.date}.txt`);
  }

  /**
   * Generates a styled local PDF of a single entry or year review.
   */
  static async exportEntryAsPdf(entry: DiaryEntry): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Decorative header
    doc.setFillColor(245, 240, 235);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(40, 30, 25);
    doc.text('Dear Diary', 20, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120, 100, 90);
    doc.text(`${entry.date}  •  ${entry.time}  •  Mood: ${entry.mood}`, 20, 28);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(20, 20, 20);
    doc.text(entry.title, 20, 50);

    // Metadata bar
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Category: ${entry.category} | Tags: ${entry.tags.join(', ')}`, 20, 58);

    doc.setDrawColor(220, 210, 200);
    doc.line(20, 62, 190, 62);

    // Body text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);

    const bodyText = entry.plainText || entry.content.replace(/<[^>]*>?/gm, '');
    const splitText = doc.splitTextToSize(bodyText, 170);
    doc.text(splitText, 20, 72);

    doc.save(`${entry.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${entry.date}.pdf`);
  }

  /**
   * Exports full diary archive as a ZIP package containing JSON metadata + media attachments.
   */
  static async exportFullZip(): Promise<void> {
    const zip = new JSZip();
    const entries = await db.entries.toArray();
    const settings = await db.settings.toCollection().first();

    const backupManifest: BackupPackage = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      app: 'Dear Diary',
      settings,
      entries: entries.map(e => ({
        ...e,
        // keep text references
      }))
    };

    zip.file('diary_data.json', JSON.stringify(backupManifest, null, 2));

    const mediaFolder = zip.folder('media');
    for (const entry of entries) {
      if (entry.media && entry.media.length > 0) {
        for (let i = 0; i < entry.media.length; i++) {
          const m = entry.media[i];
          if (m.dataUrl && m.dataUrl.includes(',')) {
            const base64Data = m.dataUrl.split(',')[1];
            const ext = m.mimeType.split('/')[1] || 'bin';
            mediaFolder?.file(`${entry.id}_media_${i + 1}.${ext}`, base64Data, { base64: true });
          }
        }
      }
      if (entry.drawingDataUrl && entry.drawingDataUrl.includes(',')) {
        const drawBase64 = entry.drawingDataUrl.split(',')[1];
        mediaFolder?.file(`${entry.id}_drawing.png`, drawBase64, { base64: true });
      }
    }

    const zipContent = await zip.generateAsync({ type: 'blob' });
    saveAs(zipContent, `dear_diary_full_archive_${new Date().toISOString().split('T')[0]}.zip`);
  }

  /**
   * Imports a verified JSON backup into local storage.
   */
  static async importJsonBackup(file: File): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as BackupPackage;

      if (!data.entries || !Array.isArray(data.entries)) {
        return { success: false, count: 0, error: 'Invalid backup file structure: missing entries.' };
      }

      // Add or update entries
      await db.entries.bulkPut(data.entries);

      if (data.timeCapsules && Array.isArray(data.timeCapsules)) {
        await db.timeCapsules.bulkPut(data.timeCapsules);
      }
      if (data.futureLetters && Array.isArray(data.futureLetters)) {
        await db.futureLetters.bulkPut(data.futureLetters);
      }
      if (data.goals && Array.isArray(data.goals)) {
        await db.goals.bulkPut(data.goals);
      }

      return { success: true, count: data.entries.length };
    } catch (err) {
      return { success: false, count: 0, error: (err as Error).message || 'Failed to parse backup file.' };
    }
  }
}

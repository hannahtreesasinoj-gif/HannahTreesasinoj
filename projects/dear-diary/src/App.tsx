import React, { useState, useEffect } from 'react';
import { db } from './db/db';
import { initializeDatabase } from './db/seed';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { DiaryEntry, MediaAttachment, ScrapbookPage } from './types';

// Components
import { LockScreen } from './components/LockScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { AppHeader } from './components/AppHeader';
import { BottomNav, type NavTab } from './components/BottomNav';
import { CreateMenuModal, type CreateAction } from './components/CreateMenuModal';
import { HomeScreen } from './components/HomeScreen';
import { DiaryFeedScreen } from './components/DiaryFeedScreen';
import { MemoriesScreen } from './components/MemoriesScreen';
import { InsightsScreen } from './components/InsightsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { EntryEditor } from './components/EntryEditor';
import { ScrapbookStudio } from './components/ScrapbookStudio';
import { HandwritingCanvas } from './components/HandwritingCanvas';
import { VoiceRecorder } from './components/VoiceRecorder';

type AppView = 'main' | 'editor' | 'scrapbook' | 'drawing' | 'voice' | 'vault';

const MainAppContent: React.FC = () => {
  const { isLocked, hasPin, isVaultUnlocked, unlockVault } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [currentView, setCurrentView] = useState<AppView>('main');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showCreateMenu, setShowCreateMenu] = useState<boolean>(false);

  // Editor states
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [activePromptText, setActivePromptText] = useState<string | undefined>(undefined);
  const [editorInitialMode, setEditorInitialMode] = useState<CreateAction | undefined>(undefined);

  // Vault PIN prompt modal
  const [showVaultPinModal, setShowVaultPinModal] = useState<boolean>(false);
  const [vaultPinInput, setVaultPinInput] = useState<string>('');
  const [vaultPinError, setVaultPinError] = useState<string>('');

  useEffect(() => {
    const initApp = async () => {
      await initializeDatabase();
      const settings = await db.settings.toCollection().first();
      if (!settings || !settings.onboardingCompleted) {
        setShowOnboarding(true);
      }
    };
    initApp();
  }, []);

  const handleOpenCreateAction = (action: CreateAction = 'write') => {
    setEditingEntry(null);
    setActivePromptText(undefined);
    setEditorInitialMode(action);

    if (action === 'scrapbook') {
      setCurrentView('scrapbook');
    } else if (action === 'draw') {
      setCurrentView('drawing');
    } else if (action === 'voice') {
      setCurrentView('voice');
    } else {
      setCurrentView('editor');
    }
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setActivePromptText(undefined);
    setCurrentView('editor');
  };

  const handleStartPrompt = (promptText: string) => {
    setEditingEntry(null);
    setActivePromptText(promptText);
    setCurrentView('editor');
  };

  const handleSaveEntry = () => {
    setCurrentView('main');
    setEditingEntry(null);
  };

  const handleSaveScrapbook = (dataUrl: string, page: ScrapbookPage) => {
    // Return to editor with attached scrapbook
    const newMedia: MediaAttachment = {
      id: 'scrapbook_' + Date.now(),
      type: 'image',
      name: 'Creative Scrapbook Page',
      mimeType: 'image/png',
      dataUrl,
      size: 0,
      isVault: false,
      isFavorite: false,
      createdAt: new Date().toISOString()
    };
    setEditingEntry(prev => ({
      id: prev?.id || 'entry_' + Date.now(),
      title: prev?.title || 'Creative Scrapbook Page',
      content: prev?.content || '<p>My handcrafted scrapbook memory ✨</p>',
      plainText: prev?.plainText || 'My handcrafted scrapbook memory',
      date: prev?.date || new Date().toISOString().split('T')[0],
      time: prev?.time || new Date().toTimeString().slice(0, 5),
      mood: prev?.mood || 'excited',
      tags: prev?.tags || ['scrapbook', 'creative'],
      category: prev?.category || 'Memories',
      media: [...(prev?.media || []), newMedia],
      scrapbookPage: page,
      isArchived: false,
      isFavorite: true,
      isVault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    setCurrentView('editor');
  };

  const handleSaveDrawing = (dataUrl: string) => {
    setEditingEntry(prev => ({
      id: prev?.id || 'entry_' + Date.now(),
      title: prev?.title || 'Handwritten Note & Sketch',
      content: prev?.content || '<p>Hand-drawn memory 🎨</p>',
      plainText: prev?.plainText || 'Hand-drawn memory',
      date: prev?.date || new Date().toISOString().split('T')[0],
      time: prev?.time || new Date().toTimeString().slice(0, 5),
      mood: prev?.mood || 'calm',
      tags: prev?.tags || ['drawing', 'art'],
      category: prev?.category || 'Creative',
      media: prev?.media || [],
      drawingDataUrl: dataUrl,
      isArchived: false,
      isFavorite: false,
      isVault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    setCurrentView('editor');
  };

  const handleSaveVoice = (audioAttachment: MediaAttachment) => {
    setEditingEntry(prev => ({
      id: prev?.id || 'entry_' + Date.now(),
      title: prev?.title || 'Voice Diary Reflection',
      content: prev?.content || '<p>Voice recording reflection 🎙️</p>',
      plainText: prev?.plainText || 'Voice recording reflection',
      date: prev?.date || new Date().toISOString().split('T')[0],
      time: prev?.time || new Date().toTimeString().slice(0, 5),
      mood: prev?.mood || 'calm',
      tags: prev?.tags || ['voice', 'audio'],
      category: prev?.category || 'Personal',
      media: [...(prev?.media || []), audioAttachment],
      isArchived: false,
      isFavorite: false,
      isVault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    setCurrentView('editor');
  };

  const handleOpenVault = () => {
    if (!hasPin || isVaultUnlocked) {
      setCurrentView('vault');
    } else {
      setShowVaultPinModal(true);
    }
  };

  const handleVerifyVaultPin = async () => {
    const success = await unlockVault(vaultPinInput);
    if (success) {
      setShowVaultPinModal(false);
      setVaultPinInput('');
      setVaultPinError('');
      setCurrentView('vault');
    } else {
      setVaultPinError('Incorrect PIN');
    }
  };

  if (isLocked) {
    return <LockScreen />;
  }

  return (
    <div className="app-container">
      {/* Onboarding Flow for 1st Time Launch */}
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Floating Create Menu */}
      <CreateMenuModal
        isOpen={showCreateMenu}
        onClose={() => setShowCreateMenu(false)}
        onSelectAction={handleOpenCreateAction}
      />

      {/* Vault PIN Verification Modal */}
      {showVaultPinModal && (
        <div className="modal-overlay" onClick={() => setShowVaultPinModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 360, textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: 8 }}>
              Unlock Private Media Vault 🔒
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Enter your diary PIN to access protected memories
            </p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter PIN"
              value={vaultPinInput}
              onChange={e => setVaultPinInput(e.target.value.replace(/\D/g, ''))}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '1.2rem',
                textAlign: 'center',
                letterSpacing: '4px',
                marginBottom: 14
              }}
            />
            {vaultPinError && <p style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: 12 }}>{vaultPinError}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleVerifyVaultPin} className="btn btn-primary" style={{ flex: 1 }}>
                Unlock
              </button>
              <button onClick={() => setShowVaultPinModal(false)} className="btn btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-STUDIO & EDITOR VIEWS */}
      {currentView === 'editor' && (
        <EntryEditor
          initialEntry={editingEntry}
          initialPrompt={activePromptText}
          initialMode={editorInitialMode}
          onSave={handleSaveEntry}
          onCancel={() => setCurrentView('main')}
          onOpenVoiceRecorder={() => setCurrentView('voice')}
          onOpenDrawingCanvas={() => setCurrentView('drawing')}
          onOpenScrapbook={() => setCurrentView('scrapbook')}
        />
      )}

      {currentView === 'scrapbook' && (
        <ScrapbookStudio
          onSaveScrapbook={handleSaveScrapbook}
          onCancel={() => setCurrentView(editingEntry ? 'editor' : 'main')}
        />
      )}

      {currentView === 'drawing' && (
        <HandwritingCanvas
          initialDataUrl={editingEntry?.drawingDataUrl}
          onSaveDrawing={handleSaveDrawing}
          onCancel={() => setCurrentView(editingEntry ? 'editor' : 'main')}
        />
      )}

      {currentView === 'voice' && (
        <VoiceRecorder
          onSaveAudio={handleSaveVoice}
          onCancel={() => setCurrentView(editingEntry ? 'editor' : 'main')}
        />
      )}

      {currentView === 'vault' && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setCurrentView('main')} className="btn btn-ghost btn-icon">
              ←
            </button>
            <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', margin: 0 }}>
              Private Media Vault 🔒
            </h2>
          </div>
          <DiaryFeedScreen
            filterVaultOnly={true}
            onEditEntry={handleEditEntry}
            onOpenCreate={() => handleOpenCreateAction('write')}
          />
        </div>
      )}

      {/* MAIN SCREEN VIEW WITH HEADER & BOTTOM NAV */}
      {currentView === 'main' && (
        <>
          <AppHeader
            onOpenSearch={() => setCurrentTab('diary')}
            onOpenVault={handleOpenVault}
          />

          {currentTab === 'home' && (
            <HomeScreen
              onOpenCreate={handleOpenCreateAction}
              onOpenEntry={handleEditEntry}
              onNavigateTab={setCurrentTab}
              onStartPrompt={handleStartPrompt}
            />
          )}

          {currentTab === 'diary' && (
            <DiaryFeedScreen
              onEditEntry={handleEditEntry}
              onOpenCreate={() => handleOpenCreateAction('write')}
            />
          )}

          {currentTab === 'memories' && (
            <MemoriesScreen onOpenEntry={handleEditEntry} />
          )}

          {currentTab === 'insights' && (
            <InsightsScreen />
          )}

          {currentTab === 'settings' && (
            <SettingsScreen />
          )}

          <BottomNav
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onOpenCreateMenu={() => setShowCreateMenu(true)}
          />
        </>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

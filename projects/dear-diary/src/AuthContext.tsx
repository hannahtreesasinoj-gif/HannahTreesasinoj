import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { db } from '../db/db';
import { SecurityService } from '../services/security';
import type { UserSettings } from '../types';

interface AuthContextType {
  isLocked: boolean;
  hasPin: boolean;
  isVaultUnlocked: boolean;
  autoLockMinutes: number;
  setupPin: (pin: string) => Promise<boolean>;
  removePin: () => Promise<boolean>;
  unlockApp: (pin: string) => Promise<boolean>;
  lockApp: () => void;
  unlockVault: (pin: string) => Promise<boolean>;
  lockVault: () => void;
  updateAutoLock: (minutes: number) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [hasPin, setHasPin] = useState<boolean>(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(false);
  const [autoLockMinutes, setAutoLockMinutes] = useState<number>(-1);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  const checkLockStatus = useCallback(async () => {
    const settings = await db.settings.toCollection().first();
    if (settings) {
      setUserSettings(settings);
      setHasPin(Boolean(settings.hasPin && settings.pinHash));
      setAutoLockMinutes(settings.autoLockMinutes ?? -1);

      if (settings.hasPin && settings.pinHash) {
        setIsLocked(true); // Lock upon launch if PIN is configured
      }
    }
  }, []);

  useEffect(() => {
    checkLockStatus();
  }, [checkLockStatus]);

  // Activity tracker for auto-lock
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('touchstart', updateActivity, { passive: true });
    window.addEventListener('mousedown', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });

    // Background interval check for inactivity
    if (autoLockMinutes > 0 && hasPin) {
      const lockThresholdMs = autoLockMinutes * 60 * 1000;
      timerRef.current = window.setInterval(() => {
        if (!isLocked && Date.now() - lastActivityRef.current > lockThresholdMs) {
          setIsLocked(true);
          setIsVaultUnlocked(false);
        }
      }, 5000);
    }

    return () => {
      window.removeEventListener('touchstart', updateActivity);
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoLockMinutes, hasPin, isLocked]);

  const setupPin = async (pin: string): Promise<boolean> => {
    const salt = SecurityService.generateSalt();
    const hash = await SecurityService.hashPin(pin, salt);
    const settings = await db.settings.toCollection().first();

    if (settings && settings.id) {
      await db.settings.update(settings.id, {
        hasPin: true,
        pinHash: hash,
        pinSalt: salt
      });
      setHasPin(true);
      setIsLocked(false);
      await checkLockStatus();
      return true;
    }
    return false;
  };

  const removePin = async (): Promise<boolean> => {
    const settings = await db.settings.toCollection().first();
    if (settings && settings.id) {
      await db.settings.update(settings.id, {
        hasPin: false,
        pinHash: undefined,
        pinSalt: undefined
      });
      setHasPin(false);
      setIsLocked(false);
      setIsVaultUnlocked(false);
      return true;
    }
    return false;
  };

  const unlockApp = async (pin: string): Promise<boolean> => {
    if (!userSettings?.pinHash || !userSettings?.pinSalt) return true;
    const isValid = await SecurityService.verifyPin(pin, userSettings.pinHash, userSettings.pinSalt);
    if (isValid) {
      setIsLocked(false);
      lastActivityRef.current = Date.now();
      return true;
    }
    return false;
  };

  const lockApp = () => {
    if (hasPin) {
      setIsLocked(true);
      setIsVaultUnlocked(false);
    }
  };

  const unlockVault = async (pin: string): Promise<boolean> => {
    if (!userSettings?.pinHash || !userSettings?.pinSalt) return true;
    const isValid = await SecurityService.verifyPin(pin, userSettings.pinHash, userSettings.pinSalt);
    if (isValid) {
      setIsVaultUnlocked(true);
      return true;
    }
    return false;
  };

  const lockVault = () => {
    setIsVaultUnlocked(false);
  };

  const updateAutoLock = async (minutes: number) => {
    setAutoLockMinutes(minutes);
    const settings = await db.settings.toCollection().first();
    if (settings && settings.id) {
      await db.settings.update(settings.id, { autoLockMinutes: minutes });
    }
  };

  const resetAllData = async () => {
    await db.entries.clear();
    await db.media.clear();
    await db.timeCapsules.clear();
    await db.futureLetters.clear();
    await db.goals.clear();
    await db.achievements.clear();
    await db.settings.clear();
    localStorage.clear();
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        isLocked,
        hasPin,
        isVaultUnlocked,
        autoLockMinutes,
        setupPin,
        removePin,
        unlockApp,
        lockApp,
        unlockVault,
        lockVault,
        updateAutoLock,
        resetAllData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

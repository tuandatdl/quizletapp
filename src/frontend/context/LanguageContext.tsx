import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { settingsApi } from "../api/settings.api";
import { useAuth } from "./AuthContext";
import type { Language, UserSettings } from "../types/api";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  settings: UserSettings | null;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<UserSettings>;
  isLoadingSettings: boolean;
  refreshSettings: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const syncThemePreference = (theme: UserSettings["themePreference"]) => {
  try {
    localStorage.setItem("tutrinh_theme", theme);
    window.dispatchEvent(new CustomEvent("tutrinh:theme", { detail: theme }));
  } catch {}
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      return (localStorage.getItem("tutrinh_lang") as Language) || "en";
    } catch {
      return "en";
    }
  });
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(false);

  const refreshSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      return;
    }
    setIsLoadingSettings(true);
    try {
      const s = await settingsApi.getSettings();
      setSettings(s);
      if (s.currentLearningLanguage) {
        setLanguageState(s.currentLearningLanguage);
        try {
          localStorage.setItem("tutrinh_lang", s.currentLearningLanguage);
        } catch {}
      }
      syncThemePreference(s.themePreference);
    } catch {}
    finally {
      setIsLoadingSettings(false);
    }
  }, [user]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const setLanguage = async (newLang: Language) => {
    if (user) {
      const updated = await settingsApi.updateSettings({ currentLearningLanguage: newLang });
      setSettings(updated);
    }
    setLanguageState(newLang);
    try { localStorage.setItem("tutrinh_lang", newLang); } catch {}
  };

  const updateSettings = async (patch: Partial<UserSettings>): Promise<UserSettings> => {
    const updated = await settingsApi.updateSettings(patch);
    setSettings(updated);
    if (patch.currentLearningLanguage) {
      setLanguageState(patch.currentLearningLanguage);
      try {
        localStorage.setItem("tutrinh_lang", patch.currentLearningLanguage);
      } catch {}
    }
    if (patch.themePreference) syncThemePreference(patch.themePreference);
    return updated;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        settings,
        updateSettings,
        isLoadingSettings,
        refreshSettings,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

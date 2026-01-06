const SETUP_COMPLETE_KEY = 'app_setup_complete';

export interface SetupConfig {
  isComplete: boolean;
  completedAt?: string;
  adminEmail?: string;
}

export const checkSetupComplete = (): boolean => {
  const stored = localStorage.getItem(SETUP_COMPLETE_KEY);
  if (!stored) return false;

  try {
    const config: SetupConfig = JSON.parse(stored);
    return config.isComplete === true;
  } catch {
    return false;
  }
};

export const markSetupComplete = (adminEmail: string): void => {
  const config: SetupConfig = {
    isComplete: true,
    completedAt: new Date().toISOString(),
    adminEmail
  };
  localStorage.setItem(SETUP_COMPLETE_KEY, JSON.stringify(config));
};

export const getSetupConfig = (): SetupConfig | null => {
  const stored = localStorage.getItem(SETUP_COMPLETE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

// Layanan Manajemen Kredensial Guru / Admin CBT
export interface TeacherCredentials {
  username: string;
  password: string;
  lastUpdated?: string;
}

const STORAGE_AUTH_KEY = 'cbt_ekonomi_admin_auth_v1';

// Default Kredensial sesuai permintaan
export const DEFAULT_TEACHER_CREDENTIALS: TeacherCredentials = {
  username: 'endang8',
  password: 'kinanel123',
};

/**
 * Mengambil kredensial guru saat ini dari localStorage,
 * fallback ke kredensial default (endang8 / kinanel123)
 */
export function getTeacherCredentials(): TeacherCredentials {
  try {
    const raw = localStorage.getItem(STORAGE_AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.username === 'string' && typeof parsed.password === 'string') {
        return {
          username: parsed.username.trim() || DEFAULT_TEACHER_CREDENTIALS.username,
          password: parsed.password || DEFAULT_TEACHER_CREDENTIALS.password,
          lastUpdated: parsed.lastUpdated,
        };
      }
    }
  } catch (err) {
    console.error('Gagal membaca kredensial admin:', err);
  }
  return DEFAULT_TEACHER_CREDENTIALS;
}

/**
 * Menyimpan kredensial guru baru ke localStorage
 */
export function saveTeacherCredentials(newCreds: { username: string; password: string }): boolean {
  try {
    const credsToSave: TeacherCredentials = {
      username: newCreds.username.trim(),
      password: newCreds.password,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(credsToSave));
    return true;
  } catch (err) {
    console.error('Gagal menyimpan kredensial admin:', err);
    return false;
  }
}

/**
 * Mengembalikan kredensial ke nilai awal bawaan pabrik (endang8 / kinanel123)
 */
export function resetTeacherCredentials(): TeacherCredentials {
  try {
    localStorage.removeItem(STORAGE_AUTH_KEY);
  } catch {
    // ignore
  }
  return DEFAULT_TEACHER_CREDENTIALS;
}

/**
 * Memvalidasi apakah username dan password yang diinput cocok
 */
export function verifyTeacherLogin(usernameInput: string, passwordInput: string): boolean {
  const current = getTeacherCredentials();
  return (
    usernameInput.trim().toLowerCase() === current.username.trim().toLowerCase() &&
    passwordInput === current.password
  );
}

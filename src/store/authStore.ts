import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: number;
}

const getStoredUsers = (): StoredUser[] => {
  try {
    const data = localStorage.getItem('moseek_users_db');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveStoredUsers = (users: StoredUser[]) => {
  localStorage.setItem('moseek_users_db', JSON.stringify(users));
};

const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + password.length;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      register: (name, email, password) => {
        const storedUsers = getStoredUsers();

        if (storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          return { success: false, error: 'Этот email уже зарегистрирован' };
        }

        if (name.trim().length < 2) {
          return { success: false, error: 'Имя слишком короткое' };
        }

        if (password.length < 6) {
          return { success: false, error: 'Пароль минимум 6 символов' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return { success: false, error: 'Некорректный email' };
        }

        const newUser: StoredUser = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2),
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashPassword(password),
          createdAt: Date.now(),
        };

        storedUsers.push(newUser);
        saveStoredUsers(storedUsers);

        set({
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            createdAt: newUser.createdAt,
          },
          isAuthenticated: true,
        });

        return { success: true };
      },

      login: (email, password) => {
        const storedUsers = getStoredUsers();
        const found = storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

        if (!found) {
          return { success: false, error: 'Пользователь не найден' };
        }

        if (found.password !== hashPassword(password)) {
          return { success: false, error: 'Неверный пароль' };
        }

        set({
          user: {
            id: found.id,
            name: found.name,
            email: found.email,
            createdAt: found.createdAt,
          },
          isAuthenticated: true,
        });

        return { success: true };
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'moseek-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

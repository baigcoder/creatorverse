import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
}));

interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    phone?: string | null;
    avatarUrl: string | null;
    creatorProfile?: unknown;
  } | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: AuthState['user']) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setUser: (user) =>
    set({ user, isAuthenticated: !!user }),
  setAccessToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    set({ accessToken: null });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));

interface AIPanelState {
  isOpen: boolean;
  conversationId: string | null;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  setConversationId: (id: string | null) => void;
}

export const useAIPanelStore = create<AIPanelState>((set) => ({
  isOpen: false,
  conversationId: null,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setConversationId: (id) => set({ conversationId: id }),
}));

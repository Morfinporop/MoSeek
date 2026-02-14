import { useEffect } from 'react';
import { Background } from './components/Background';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatContainer } from './components/ChatContainer';
import { ChatInput } from './components/ChatInput';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import { aiService } from './services/aiService';

export function App() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const { user, isAuthenticated } = useAuthStore();
  const { syncFromCloud } = useChatStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      aiService.setUserId(user.id);
      syncFromCloud(user.id);
    } else {
      aiService.setUserId(null);
    }
  }, [isAuthenticated, user?.id]);

  return (
    <div className={`relative min-h-screen min-h-dvh ${isDark ? 'bg-[#000]' : 'bg-[#fff]'}`}>
      <Background />
      <Sidebar />

      <div className="relative z-10 flex flex-col min-h-screen min-h-dvh">
        <Header />
        <main className="flex-1 flex flex-col pt-14 pb-36">
          <ChatContainer />
        </main>
        <footer className={`fixed bottom-0 left-0 right-0 z-20 pb-4 pt-5 ${
          isDark
            ? 'bg-gradient-to-t from-black via-black/90 to-transparent'
            : 'bg-gradient-to-t from-white via-white/90 to-transparent'
        }`}>
          <ChatInput />
        </footer>
      </div>
    </div>
  );
}

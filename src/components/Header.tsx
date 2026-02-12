import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

export function Header() {
  const { toggleSidebar } = useChatStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="border-b border-white/5">
        <div className="max-w-5xl mx-auto h-16 flex items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="p-2.5 rounded-xl hover:bg-white/10 transition-all ml-2 sm:ml-4 lg:ml-0 lg:absolute lg:left-4"
          >
            <Menu className="w-5 h-5 text-zinc-400" />
          </motion.button>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                MoSeek
              </h1>
              <span className="text-[10px] text-zinc-600 px-2 py-0.5 rounded-full bg-white/5 hidden sm:inline">MoSeek V3</span>
            </div>
          </div>

          <div className="flex-1" />
        </div>
      </div>
    </motion.header>
  );
}

import { motion } from 'framer-motion';
import { Copy, Check, ChevronDown, ChevronUp, Film } from 'lucide-react';
import { useState } from 'react';
import { marked } from 'marked';
import type { Message } from '../types';
import { MODEL_ICON } from '../config/models';
import { useThemeStore } from '../store/themeStore';

interface ChatMessageProps {
  message: Message;
  compact?: boolean;
  hideModelLabel?: boolean;
}

marked.setOptions({
  breaks: true,
  gfm: true,
});

const MAX_LENGTH = 500;

export function ChatMessage({ message, compact, hideModelLabel }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [expandedMedia, setExpandedMedia] = useState<string | null>(null);
  const isAssistant = message.role === 'assistant';
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  const isLong = message.content.length > MAX_LENGTH && !message.isLoading;
  const displayContent = isLong && !expanded ? message.content.slice(0, MAX_LENGTH) + '...' : message.content;
  const hasAttachments = message.attachments && message.attachments.length > 0;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const renderAttachments = () => {
    if (!hasAttachments) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-2">
        {message.attachments!.map((attachment) => (
          <div key={attachment.id} className="relative">
            {attachment.type === 'image' ? (
              <>
                <motion.img
                  src={attachment.url}
                  alt={attachment.name}
                  className="max-w-[280px] max-h-[200px] rounded-xl object-cover cursor-pointer border border-white/10 hover:border-violet-500/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setExpandedMedia(expandedMedia === attachment.id ? null : attachment.id)}
                />

                {/* Полноразмерное превью */}
                {expandedMedia === attachment.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setExpandedMedia(null)}
                  >
                    <motion.img
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      src={attachment.url}
                      alt={attachment.name}
                      className="max-w-full max-h-full object-contain rounded-2xl"
                    />
                  </motion.div>
                )}
              </>
            ) : (
              <div className="max-w-[280px] rounded-xl overflow-hidden border border-white/10">
                <video
                  src={attachment.url}
                  controls
                  className="max-w-full max-h-[200px] rounded-xl"
                  preload="metadata"
                >
                  <track kind="captions" />
                </video>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-black/30">
                  <Film className="w-3 h-3 text-violet-400" />
                  <span className="text-[10px] text-zinc-400 truncate">{attachment.name}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (message.isLoading) {
      return <TypingIndicator />;
    }

    if (isAssistant) {
      let html = marked.parse(displayContent, { async: false }) as string;

      html = html.replace(/<pre><code(.*?)>([\s\S]*?)<\/code><\/pre>/g, (_match, attrs, code) => {
        const decodedCode = code
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        return `
          <div class="code-block-wrapper relative group/code my-3">
            <pre class="!bg-black/50 !border !border-violet-500/20 rounded-xl overflow-hidden"><code${attrs}>${code}</code></pre>
            <button 
              class="copy-code-btn absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/40 flex items-center gap-2 opacity-0 group-hover/code:opacity-100 transition-all border border-violet-500/30"
              data-code="${encodeURIComponent(decodedCode)}"
            >
              <svg class="w-4 h-4 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <span class="text-xs text-violet-300">Копировать</span>
            </button>
          </div>
        `;
      });

      return (
        <div>
          <div
            className={`prose prose-sm max-w-none break-words overflow-hidden ${
              isLight ? 'text-zinc-800' : 'text-zinc-200'
            }`}
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            dangerouslySetInnerHTML={{ __html: html }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const btn = target.closest('.copy-code-btn') as HTMLButtonElement;
              if (btn) {
                const code = decodeURIComponent(btn.dataset.code || '');
                copyCode(code);
              }
            }}
          />
          {isLong && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 transition-all"
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-violet-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-violet-400" />
              )}
              <span className="text-xs text-violet-300">
                {expanded ? 'Свернуть' : 'Показать полностью'}
              </span>
            </motion.button>
          )}
        </div>
      );
    }

    return (
      <div>
        {displayContent && displayContent !== '(медиа файл)' && (
          <p
            className="text-[15px] leading-relaxed text-white whitespace-pre-wrap break-words overflow-hidden"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          >
            {displayContent}
          </p>
        )}
        {isLong && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-white/70" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-white/70" />
            )}
            <span className="text-xs text-white/70">
              {expanded ? 'Свернуть' : 'Показать полностью'}
            </span>
          </motion.button>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex gap-4 ${isAssistant ? '' : 'flex-row-reverse'}`}
    >
      <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center">
        {isAssistant ? (
          <img
            src={MODEL_ICON}
            alt="MoGPT"
            className={`w-11 h-11 object-contain ${isLight ? 'filter brightness-0' : 'filter brightness-0 invert'}`}
          />
        ) : (
          <img
            src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
            alt="User"
            className={`w-11 h-11 object-contain ${isLight ? 'filter brightness-0' : 'filter brightness-0 invert'}`}
          />
        )}
      </div>

      <div className={`group relative ${compact ? 'max-w-full flex-1' : 'max-w-[85%]'} min-w-0 overflow-hidden`}>
        {isAssistant && message.model && !hideModelLabel && (
          <div className="mb-1.5 px-1">
            <span className={`text-[11px] font-medium tracking-wide ${
              isLight ? 'text-zinc-900' : 'text-white'
            }`}>
              {message.model}
            </span>
          </div>
        )}

        <motion.div
          whileHover={{ scale: 1.005 }}
          className={`relative px-4 py-3 rounded-2xl overflow-hidden ${
            isAssistant
              ? isLight
                ? 'bg-white border border-zinc-200 shadow-sm rounded-tl-md'
                : 'glass-light rounded-tl-md'
              : isLight
                ? 'bg-gradient-to-br from-violet-500 to-purple-600 rounded-tr-md shadow-md'
                : 'bg-gradient-to-br from-violet-500 to-purple-600 rounded-tr-md shadow-lg shadow-violet-500/10'
          }`}
        >
          {/* Медиа-файлы пользователя */}
          {!isAssistant && renderAttachments()}

          {renderContent()}

          {!message.isLoading && (
            <motion.button
              initial={{ opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              onClick={copyToClipboard}
              className={`absolute -right-2 -top-2 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                isAssistant
                  ? isLight
                    ? 'bg-white shadow-md hover:bg-zinc-50 border border-zinc-200'
                    : 'glass-strong hover:bg-white/10'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className={`w-3.5 h-3.5 ${isLight && isAssistant ? 'text-zinc-500' : 'text-zinc-400'}`} />
              )}
            </motion.button>
          )}
        </motion.div>

        <div className={`flex items-center gap-2 mt-1.5 px-1 ${isAssistant ? '' : 'justify-end'}`}>
          <span className={`text-[10px] ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {copiedCode && (
            <span className="text-[10px] text-green-400">Код скопирован!</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-violet-400 typing-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <span className="text-sm text-zinc-500 ml-1">Печатаю...</span>
    </div>
  );
}

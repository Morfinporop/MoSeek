import type { AIModel } from '../types';

export const MODEL_ICON = 'https://img.icons8.com/?size=100&id=77iHQnb2ZTjZ&format=png&color=1A1A1A';

export const AI_MODELS: AIModel[] = [
  {
    id: 'google/gemma-3-27b-it',
    name: 'MoSeek Gemma',
    description: 'Компактная и умная',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-amber-500 to-yellow-600',
  },
  {
    id: 'qwen/qwen3-30b-a3b',
    name: 'MoSeek Qwen',
    description: 'Быстрая модель Qwen3',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-sky-400 to-cyan-500',
  },
  {
    id: 'mistralai/devstral-small',
    name: 'MoSeek Devstral',
    description: 'Модель специально для кода',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'MoSeek GPT-3.5 Turbo',
    description: 'Универсальная модель без лимитов',
    provider: 'OpenAI',
    icon: MODEL_ICON,
    color: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'huggingface/llama2-7b-chat',
    name: 'MoSeek Llama2 Chat',
    description: 'Модель для чат-ботов без ограничений',
    provider: 'HuggingFace',
    icon: MODEL_ICON,
    color: 'from-green-400 to-emerald-500',
  },
  {
    id: 'microsoft/phi-2',
    name: 'MoSeek Phi-2',
    description: 'Лёгкая и быстрая модель без лимитов',
    provider: 'Microsoft',
    icon: MODEL_ICON,
    color: 'from-purple-400 to-violet-500',
  },
];

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

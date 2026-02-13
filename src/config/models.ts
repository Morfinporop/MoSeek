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
    id: 'qwen/qwen3-32b',
    name: 'MoSeek Qwen 32B',
    description: 'Средняя Qwen3 32B',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-blue-400 to-sky-500',
  },
  {
    id: 'qwen/qwen3-14b',
    name: 'MoSeek Qwen 14B',
    description: 'Компактная Qwen3 14B',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-cyan-400 to-sky-500',
  },
  {
    id: 'microsoft/phi-4',
    name: 'MoSeek Phi-4',
    description: 'Компактная Microsoft Phi-4',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-indigo-400 to-blue-500',
  },
  {
    id: 'mistralai/mistral-nemo',
    name: 'MoSeek Nemo',
    description: 'Mistral Nemo 12B',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-rose-400 to-pink-500',
  },
  {
    id: 'google/gemma-3-4b-it',
    name: 'MoSeek Gemma 4B',
    description: 'Мини Gemma 4B',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-amber-300 to-yellow-400',
  },
  {
    id: 'google/gemma-3-12b-it',
    name: 'MoSeek Gemma 12B',
    description: 'Средняя Gemma 12B',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-yellow-400 to-amber-400',
  },
];

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

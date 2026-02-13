import type { AIModel } from '../types';

export const MODEL_ICON = 'https://img.icons8.com/?size=100&id=77iHQnb2ZTjZ&format=png&color=1A1A1A';

export const AI_MODELS: AIModel[] = [
  {
    id: 'mistralai/mistral-nemo',
    name: 'MoSeek Nemo',
    description: 'Mistral Nemo 12B',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-rose-400 to-pink-500',
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct:free',
    name: 'MoSeek Llama 8B',
    description: 'Llama 3.1 8B',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-violet-400 to-purple-500',
  },
  {
    id: 'google/gemma-2-9b-it:free',
    name: 'MoSeek Gemma 9B',
    description: 'Gemma 2 9B',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-blue-400 to-cyan-500',
  },
  {
    id: 'qwen/qwen-2.5-7b-instruct:free',
    name: 'MoSeek Qwen 7B',
    description: 'Qwen 2.5 7B',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-amber-400 to-yellow-500',
  },
  {
    id: 'microsoft/phi-3-mini-128k-instruct:free',
    name: 'MoSeek Phi-3',
    description: 'Microsoft Phi-3 Mini',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-sky-400 to-blue-500',
  },
  {
    id: 'openchat/openchat-7b:free',
    name: 'MoSeek Chat 7B',
    description: 'OpenChat 7B',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-teal-400 to-cyan-500',
  },
  {
    id: 'huggingfaceh4/zephyr-7b-beta:free',
    name: 'MoSeek Zephyr',
    description: 'Zephyr 7B',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-lime-400 to-green-500',
  },
];

// Несколько API URL для отказоустойчивости
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const OPENROUTER_API_URL_V2 = 'https://openrouter.ai/api/v1/chat/completions';

// Альтернативные бесплатные API
export const API_ENDPOINTS = {
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  huggingface: 'https://api-inference.huggingface.co/models',
  together: 'https://api.together.xyz/v1/chat/completions',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  cerebras: 'https://api.cerebras.ai/v1/chat/completions',
  lepton: 'https://api.lepton.ai/v1/chat/completions',
  fireworks: 'https://api.fireworks.ai/inference/v1/chat/completions',
  novita: 'https://api.novita.ai/v3/openai/chat/completions',
  chutes: 'https://chutes.ai/api/v1/chat/completions',
};

import type { AIModel } from '../types';

export const MODEL_ICON = 'https://img.icons8.com/?size=100&id=77iHQnb2ZTjZ&format=png&color=1A1A1A';

export const AI_MODELS: AIModel[] = [
  // DeepSeek - самые стабильные бесплатные модели
  {
    id: 'deepseek/deepseek-chat:free',
    name: 'MoSeek DeepChat',
    description: 'DeepSeek Chat (бесплатно, стабильная)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=wNdoIFLRlXCJ&format=png&color=000000',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'MoSeek R1',
    description: 'DeepSeek R1 - Reasoning (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=wNdoIFLRlXCJ&format=png&color=3B82F6',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    id: 'deepseek/deepseek-r1-distill-llama-70b:free',
    name: 'MoSeek R1 Llama 70B',
    description: 'DeepSeek R1 Llama 70B (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=wNdoIFLRlXCJ&format=png&color=6366F1',
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'deepseek/deepseek-r1-distill-qwen-32b:free',
    name: 'MoSeek R1 Qwen 32B',
    description: 'DeepSeek R1 Qwen 32B (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=wNdoIFLRlXCJ&format=png&color=8B5CF6',
    color: 'from-purple-500 to-fuchsia-600',
  },

  // Google Gemini
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'MoSeek Gemini 2.0',
    description: 'Gemini 2.0 Flash (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=kOPTH4LnJoIq&format=png&color=000000',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    id: 'google/gemini-flash-1.5:free',
    name: 'MoSeek Gemini 1.5',
    description: 'Gemini Flash 1.5 (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=kOPTH4LnJoIq&format=png&color=4285F4',
    color: 'from-indigo-400 to-blue-500',
  },
  {
    id: 'google/gemini-pro-1.5:free',
    name: 'MoSeek Gemini Pro',
    description: 'Gemini Pro 1.5 (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=kOPTH4LnJoIq&format=png&color=34A853',
    color: 'from-green-400 to-emerald-500',
  },
  {
    id: 'google/gemma-2-9b-it:free',
    name: 'MoSeek Gemma 9B',
    description: 'Gemma 2 9B (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=kOPTH4LnJoIq&format=png&color=EA4335',
    color: 'from-red-400 to-rose-500',
  },

  // Meta Llama
  {
    id: 'meta-llama/llama-3.2-11b-vision-instruct:free',
    name: 'MoSeek Vision',
    description: 'Llama 3.2 Vision 11B (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=MWc8B0bgcXAT&format=png&color=000000',
    color: 'from-purple-400 to-violet-500',
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct:free',
    name: 'MoSeek Llama 8B',
    description: 'Llama 3.1 8B (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=MWc8B0bgcXAT&format=png&color=7C3AED',
    color: 'from-violet-400 to-purple-500',
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'MoSeek Llama 3B',
    description: 'Llama 3.2 3B - быстрая (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=MWc8B0bgcXAT&format=png&color=A855F7',
    color: 'from-fuchsia-400 to-purple-500',
  },

  // Mistral
  {
    id: 'mistralai/mistral-nemo',
    name: 'MoSeek Nemo',
    description: 'Mistral Nemo 12B (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=77iHQnb2ZTjZ&format=png&color=1A1A1A',
    color: 'from-rose-400 to-pink-500',
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'MoSeek Mistral 7B',
    description: 'Mistral 7B Instruct (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=77iHQnb2ZTjZ&format=png&color=F97316',
    color: 'from-orange-400 to-red-500',
  },
  {
    id: 'mistralai/mixtral-8x7b-instruct:free',
    name: 'MoSeek Mixtral 8x7B',
    description: 'Mixtral 8x7B (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=77iHQnb2ZTjZ&format=png&color=EF4444',
    color: 'from-red-500 to-orange-600',
  },

  // Qwen
  {
    id: 'qwen/qwen-2-7b-instruct:free',
    name: 'MoSeek Qwen 7B',
    description: 'Qwen 2 7B (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=nFz69FUBEVWE&format=png&color=000000',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    id: 'qwen/qwen-2.5-7b-instruct:free',
    name: 'MoSeek Qwen 2.5',
    description: 'Qwen 2.5 7B (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=nFz69FUBEVWE&format=png&color=F59E0B',
    color: 'from-amber-400 to-yellow-500',
  },

  // Microsoft
  {
    id: 'microsoft/phi-3-medium-128k-instruct:free',
    name: 'MoSeek Phi-3',
    description: 'Microsoft Phi-3 (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=VLKafOkk3sBX&format=png&color=000000',
    color: 'from-sky-400 to-blue-500',
  },
  {
    id: 'microsoft/phi-3-mini-128k-instruct:free',
    name: 'MoSeek Phi-3 Mini',
    description: 'Microsoft Phi-3 Mini (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=VLKafOkk3sBX&format=png&color=0EA5E9',
    color: 'from-cyan-400 to-sky-500',
  },

  // Другие популярные
  {
    id: 'nousresearch/hermes-3-llama-3.1-405b:free',
    name: 'MoSeek Hermes 405B',
    description: 'Hermes 3 Llama 405B (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=iWw83PVcBpLw&format=png&color=000000',
    color: 'from-fuchsia-400 to-pink-500',
  },
  {
    id: 'openchat/openchat-7b:free',
    name: 'MoSeek Chat 7B',
    description: 'OpenChat 7B (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=jrXaWEpenHwM&format=png&color=000000',
    color: 'from-teal-400 to-cyan-500',
  },
  {
    id: 'huggingfaceh4/zephyr-7b-beta:free',
    name: 'MoSeek Zephyr 7B',
    description: 'Zephyr 7B Beta (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=GKfgYcdXivKO&format=png&color=000000',
    color: 'from-lime-400 to-green-500',
  },
  {
    id: 'liquid/lfm-40b:free',
    name: 'MoSeek Liquid 40B',
    description: 'Liquid LFM 40B (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=82751&format=png&color=000000',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'cohere/command-r-08-2024:free',
    name: 'MoSeek Command R',
    description: 'Cohere Command R (бесплатно)',
    provider: 'MoGPT',
    icon: 'https://img.icons8.com/?size=100&id=xuvGCOXi8Wyg&format=png&color=000000',
    color: 'from-pink-400 to-rose-500',
  },
];

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

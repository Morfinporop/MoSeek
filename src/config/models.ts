import type { AIModel } from '../types';

export const MODEL_ICON = 'https://img.icons8.com/?size=100&id=77iHQnb2ZTjZ&format=png&color=1A1A1A';

export const AI_MODELS: AIModel[] = [
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'MoSeek GLM 4.5',
    description: 'GLM 4.5 Air',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'stepfun/step-3.5-flash:free',
    name: 'MoSeek Step 3.5',
    description: 'Step 3.5 Flash',
    provider: 'MoGPT',
    icon: MODEL_ICON,
    color: 'from-cyan-400 to-blue-500',
  },
];

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

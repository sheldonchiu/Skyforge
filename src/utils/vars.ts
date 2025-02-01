import { PaperspaceSetup } from '../components/cloudPlatforms';

// Home.tsx
export interface Platform {
    id: string;
    name: string;
    icon: string;
    description: string;
    component: React.ComponentType;
    bgColor: string;
    borderColor: string;
}

export interface SetupGuideProps {
  platform: Platform;
  onBack: () => void;
}
  
export const CLOUD_PLATFORMS: Platform[] = [
  {
    id: 'paperspace',
    name: 'Paperspace',
    icon: '🚀',
    description: 'Cloud GPU platform with both subscription and on-demand pricing.',
    component: PaperspaceSetup,
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-800'
  }
];

// EnvMenu.tsx
interface ToolsMenuField {
  id: string;
  name: string;
  desc: string;
  iconUrl?: string;
}

interface ToolsMenuSection {
  id: string;
  title: string;
  fields: ToolsMenuField[];
}

interface ToolsMenuConfigType {
  sections: ToolsMenuSection[];
}

// Form field configuration
export const ToolsMenuConfig: ToolsMenuConfigType = {
  sections: [
    {
      id: 'stableDiffusion',
      title: 'Stable Diffusion',
      fields: [
        {
          id: 'sdWebUI',
          name: 'Stable Diffusion WebUI',
          desc: 'WebUI for Stable Diffusion',
          iconUrl: './src/assets/envs/sdwebui.png'
        },
        {
          id: 'sdComfy',
          name: 'Stable Diffusion ComfyUI',
          desc: '',
        },
      ]
    },
    {
      id: 'llm',
      title: 'Large Language Model',
      fields: [
        {
          id: 'llmOpenWebUI',
          name: 'Open WebUI',
          desc: 'Open WebUI for Large Language Model',
        },
      ]
    }
  ]
};
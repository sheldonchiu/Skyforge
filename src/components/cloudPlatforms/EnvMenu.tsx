import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolsMenuConfig } from '../../utils/vars';

// TypeScript interfaces
interface Field {
  id: string;
  name: string;
  desc: string;
  iconUrl?: string;
}

interface Section {
  id: string;
  title: string;
  fields: Field[];
}

interface MenuConfigType {
  sections: Section[];
}

// Form field configuration
const MenuConfig: MenuConfigType = {
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

interface SavedMenuState {
  [key: string]: boolean;
}

export const EnvMenu: React.FC = () => {
  const { t } = useTranslation();
  const [activeMenu, setActiveMenu] = useState<string>('main');
  const [savedMenu, setSavedMenu] = useState<SavedMenuState>({});

  const CardGrid: React.FC = () => (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {MenuConfig.sections.map((section) => (
        <div
          key={section.id}
          className="collapse bg-base-100 border border-base-300 rounded-lg overflow-hidden"
        >
          <input type="checkbox" className="peer" />
          <div className="collapse-title flex items-center justify-between p-4 peer-checked:bg-base-200">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <span className="text-sm opacity-20">
              {section.fields.length} items
            </span>
          </div>
          <div className="collapse-content bg-base-100">
            <div className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 auto-rows-fr gap-4">
                {section.fields.map((field) => (
                  <div
                    key={field.id}
                    className="relative group h-full"
                  >
                    <div className="absolute -top-2 -right-2 z-10">
                      {savedMenu[field.id] ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-selector text-xs font-medium bg-success text-success-content">
                          Selected
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-selector text-xs font-medium bg-error text-error-content">
                          Unselected
                        </span>
                      )}
                    </div>
                    <div className="card bg-base-200 hover:bg-base-300 transition-colors duration-200 rounded-lg overflow-hidden h-full flex flex-col">
                      <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold leading-6 mb-2 break-words">
                            {field.name}
                          </h3>
                          <p className="text-sm opacity-60 break-words">
                            {field.desc}
                          </p>
                        </div>
                        {field.iconUrl && (
                          <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16">
                            <img
                              src={field.iconUrl}
                              alt={`${field.name} icon`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const MenuContent: React.FC<{ menuId: string }> = ({ menuId }) => {
    if (menuId === "main") {
      return <CardGrid />;
    }
    return null;
  };

  return (
    <div>
      <MenuContent menuId={activeMenu} />
    </div>
  );
};

export default EnvMenu;

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, CLOUD_PLATFORMS, SetupGuideProps } from '../utils/vars';

const SetupGuide: React.FC<SetupGuideProps> = ({ platform, onBack }) => {
  const SetupComponent = platform.component;

  return (
    <div className="py-12">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-base-content link-hover"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Platform Selection
      </button>
      <div className="bg-base-300 rounded-box shadow-sm p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">{platform.icon}</span>
            <h2 className="text-2xl font-bold text-base-content">
              {platform.name} Environment Setup
            </h2>
          </div>
          <SetupComponent />
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  if (selectedPlatform) {
    return (
      <SetupGuide
        platform={selectedPlatform}
        onBack={() => setSelectedPlatform(null)}
      />
    );
  }

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-base-content mb-4">
          {t('home.title')}
        </h1>
        <p className="text-lg text-base-content max-w-2xl mx-auto">
          {t('home.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {CLOUD_PLATFORMS.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setSelectedPlatform(platform)}
            className={`group p-6 rounded-box border-2 transition-all duration-200
              ${platform.bgColor} ${platform.borderColor}
              hover:scale-105 hover:shadow-lg text-left`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{platform.icon}</span>
              <h3 className="text-xl font-semibold text-base-content">
                {t(`platforms.${platform.id}.name`)}
              </h3>
            </div>
            <p className="text-base-content">
              {t(`platforms.${platform.id}.description`)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;

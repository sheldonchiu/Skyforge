/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// src/components/sections/cloudPlatforms/PaperspaceSetup.tsx

import axios from 'axios';
import { storageUtil } from '../../utils';
import { useFormRefs } from '../../hooks';
import { useState, useRef, useEffect, FormEvent, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicForm } from './EnvForm';
import { EnvMenu } from './EnvMenu';

interface GPUData {
  name: string;
  gpuMemory: number;
  cpus: number;
  memory: number;
  hourlyRate: string;
  isAvailable: boolean;
  isUsable: boolean;
  kind: string;
}

interface Tab {
  id: string;
  label: string;
}

const PaperspaceSetup = (): ReactElement => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('login');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [paperspaceUser, setPaperspaceUser] = useState<string | null>(null);
  const [paperspaceUserId, setPaperspaceUserId] = useState<string | null>(null);
  const [paperspaceToken, setPaperspaceToken] = useState<string | null>(null);

  const [authError, setAuthError] = useState<string | null>(null);

  const [gpuList, setGpuList] = useState<GPUData[]>([]);
  const [selectedGpuId, setSelectedGpuId] = useState<string | null>(null);
  const [gpuSelectError, setGpuSelectError] = useState<string | null>(null);

  const { formRef, refs, getFormData, resetForm } = useFormRefs(['email', 'password']);

  const tabs = [
    { id: "login", label: t('paperspace.tabs.login') },
    { id: 'gpu', label: t('paperspace.tabs.gpu') },
    { id: 'env', label: t('paperspace.tabs.environment') },
    { id: 'control', label: t('paperspace.tabs.control') }
  ];

  useEffect(() => {
    const token = storageUtil.getItemWithTTL('paperspace_jwt');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    const userEmail = localStorage.getItem('paperspace_user');
    const userId = localStorage.getItem('paperspace_userId');

    if (token && userEmail && userId) {
      setIsAuthenticated(true);
      setPaperspaceUser(userEmail);
      setPaperspaceUserId(JSON.parse(userId));
      setPaperspaceToken(token);
    }
  }, []);

  const handleSelectGpu = (id: string) => {
    setSelectedGpuId(id);
  };

  const handleAuthentication = async (e: FormEvent) => {
    e.preventDefault();

    const formData = getFormData();
    if (!formData) {
      setAuthError('Form data is empty');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const response = await axios.post('https://api.paperspace.io/users/login?include=user', {
        email: formData.email,
        password: formData.password,
        PS_REQUEST_VALIDATION_KEY: 'Nu/CfHRkn2A1YqTQHNfzrWgIJF+iV/0B+QfTXDcya2g='
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      storageUtil.setItemWithTTL('paperspace_jwt', response.data.id, response.data.ttl, response.data.created);
      localStorage.setItem('paperspace_userId', JSON.stringify(response.data.userId));
      localStorage.setItem('paperspace_user', JSON.stringify(response.data.user.email));

      setPaperspaceUser(response.data.user.email);
      setPaperspaceUserId(response.data.userId);
      setIsAuthenticated(true);

    } catch (error: any) {
      if (error.response?.status === 401) {
        setAuthError('Invalid email or password, please check your credentials');
      } else {
        setAuthError(error.message);
      }

    } finally {
      setIsAuthenticating(false);
    }
  };

  const syncGPUList = async (e: FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setGpuSelectError(t('paperspace.errors.notAuthenticated'));
      return;
    }

    setIsLoading(true);
    setGpuSelectError(null);

    try {
      let subscription: any = null;
      let teamNamespace: string | null = null;
      let freeGPUList: string[] = [];
      let paidGPUList: string[] = [];
      const GPUList: { 'Free': GPUData[], 'Paid': GPUData[], 'Unusable': GPUData[] } = { 'Free': [], 'Paid': [], 'Unusable': [] };

      const response = await axios.get(`https://api.paperspace.io/users/${paperspaceUserId}?access_token=${paperspaceToken}&filter[include][teamMemberships][team][stripe][gradientSubscription]`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      subscription = response.data.teamMemberships[0].team.stripe.gradientSubscription;
      teamNamespace = response.data.userTeam[0].namespace;
      freeGPUList = subscription.enabledMachineTypes;
      paidGPUList = subscription.enabledMachineTypesWithCreditCard;

      const vmResponse = await axios.get(`https://api.paperspace.io/vmTypes/getVmTypesByClusters?access_token=${paperspaceToken}&namespace=${teamNamespace}&includePublicClusters=true`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const keys = Object.keys(vmResponse.data);
      if (keys.length === 1) {
        const data = vmResponse.data[keys[0]];
        data.forEach((gpu: any) => {
          let hourlyRate: string = '';
          for (const usageRate of gpu.vmType.defaultUsageRates) {
            if (usageRate.type === 'hourly') {
              hourlyRate = `${usageRate.usageRate.rateHourly}/hr`;
              break;
            }
          };

          const gpuData: GPUData = {
            name: gpu.vmType.label,
            gpuMemory: gpu.vmType.gpuModel.memInGb,
            cpus: gpu.vmType.cpus,
            memory: ~~(parseInt(gpu.vmType.ram) / 1000000000),
            hourlyRate: parseFloat(hourlyRate) === 0.0 ? 'Free' : hourlyRate,
            isAvailable: gpu.isAvailable,
            isUsable: freeGPUList.includes(gpu.vmType.label) || paidGPUList.includes(gpu.vmType.label),
            kind: gpu.vmType.kind
          };

          // Ignore CPU instances
          if (!gpuData.kind.includes('cpu')) {
            // Always keep free GPUs at the top of the list
            if (freeGPUList.includes(gpuData.name)) {
              GPUList['Free'].push(gpuData);
            } else if (paidGPUList.includes(gpuData.name)) {
              GPUList['Paid'].push(gpuData);
            } else {
              GPUList['Unusable'].push(gpuData);
            }
          }

        });
      }
      else {
        throw new Error("Unknown error occurred");
      }

      setGpuList(GPUList['Free'].concat(GPUList['Paid'], GPUList['Unusable']));
    } catch (err) {
      console.error(err);
      setGpuSelectError(t('paperspace.errors.syncFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const TabContent = ({ tabId }: { tabId: string }): ReactElement | null => {
    switch (tabId) {
      case 'login':
        return (
          <form ref={formRef} onSubmit={handleAuthentication} className="space-y-4">
            <fieldset className="fieldset w-auto bg-base-100 p-4 rounded-box">

              {/* Error Message */}
              {authError && (
                <div role="alert" className="alert alert-error mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{authError}</span>
                </div>
              )}

              <label className="fieldset-label">{t('paperspace.auth.email')}</label>
              <input
                ref={refs.email}
                type="email"
                name="email"
                required
                className="input w-full"
              />

              <label className="fieldset-label mt-4">{t('paperspace.auth.password')}</label>
              <input
                ref={refs.password}
                type="password"
                name="password"
                required
                className="input w-full"
              />

              {/* Submit Button */}
              <button
                type="submit"
                className='w-full btn btn-primary mt-4'
              >
                {isAuthenticating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="loading loading-spinner loading-md"></span>
                    {t('paperspace.auth.authenticating')}
                  </span>
                ) : (
                  t('paperspace.auth.login')
                )}
              </button>
            </fieldset>
          </form>
        );
      case 'gpu': {
        const selectedGPU = gpuList.find((gpu) => gpu.name === selectedGpuId);
        return (
          <div className="space-y-4 p-8 w-full bg-base-100 rounded-box">
            <div className="flex items-center gap-4 transition-all duration-200">
              {isLoading ? (
                <span>
                  <span className="loading loading-ring loading-md"></span>
                </span>
              ) : (
                <button
                  onClick={syncGPUList}
                  disabled={isLoading}
                  className="btn text-md btn-primary"
                >
                  {t('paperspace.syncGPUs')}
                </button>
              )}
            </div>

            {gpuSelectError && (
              <div role="alert" className="alert alert-error mb-4">
                <span>{gpuSelectError}</span>
              </div>
            )}

            {selectedGpuId && selectedGPU && (
              <fieldset className="fieldset w-full bg-base-200 border border-base-300 p-4 rounded-box">
                <legend className="fieldset-legend">{t('selected')}</legend>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedGPU.name}
                    </h3>
                    <p className="text-sm">
                      <span className={`${selectedGPU.hourlyRate === 'Free' ? 'text-success' : 'text-error'}`}>
                        {selectedGPU.hourlyRate}
                      </span> | {selectedGPU.cpus}CPU | {selectedGPU.memory} GB RAM | {selectedGPU.gpuMemory}GB VRAM
                    </p>
                  </div>
                </div>
              </fieldset>
            )}

            <div className="rounded-box overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <div className="grid gap-px">
                  {gpuList.map((gpu) => (
                    <label
                      key={gpu.name}
                      className={`bg-base-200 p-4 transition-colors duration-200 has-checked:bg-base-300 ${gpu.isUsable ? '' : 'opacity-50'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {gpu.name} <span>{gpu.isUsable ? <span className="text-warning">{gpu.isAvailable ? '' : t('paperspace.gpuUnavailable')}</span> : t('paperspace.gpuNotUsable')}</span>
                          </h3>
                          <p className="text-sm">
                            <span className={`${gpu.hourlyRate === 'Free' ? 'text-success' : 'text-error'}`}>
                              {gpu.hourlyRate}
                            </span> | {gpu.cpus}CPU | {gpu.memory} GB RAM | {gpu.gpuMemory}GB VRAM
                          </p>
                        </div>
                        <div className="flex items-center h-5">
                          <input
                            type="radio"
                            name="selected-gpu"
                            disabled={!gpu.isUsable}
                            checked={selectedGpuId === gpu.name}
                            onChange={() => handleSelectGpu(gpu.name)}
                            className="h-4 w-4 border-gray-300 cursor-pointer focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {!gpuList.length && !isLoading && (
              <div role="alert" className="alert alert-info">
                {t('paperspace.noGPUs')}
              </div>
            )}
          </div>
        );
      }

      case 'env':
        return (
          <div className="bg-base-100 rounded-box">
            <EnvMenu />
          </div>
        );

      case 'control':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-box">
              <p className="text-yellow-600 dark:text-yellow-400">
                {t('paperspace.controlPlaceholder')}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="bg-base-100 rounded-box">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`status status-md ${isAuthenticated ? 'status-success' : ''}`} />
            <span className="text-sm font-medium">
              {isAuthenticated && paperspaceUser ? (
                <span className="flex items-center gap-2">
                  {t('paperspace.auth.loggedInAs')}
                  <span className="font-semibold">
                    {paperspaceUser}
                  </span>
                </span>
              ) : (
                t('paperspace.auth.notLoggedIn')
              )}
            </span>
          </div>
        </div>
      </div>
      <div role="tablist" className="tabs tabs-border mt-4">
        {tabs.map((tab) => (
          <button
            role="tab"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <TabContent tabId={activeTab} />
      </div>
    </div>
  );
};

export default PaperspaceSetup;

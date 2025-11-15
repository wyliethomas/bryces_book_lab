import React, { useState } from 'react';
import { Brain, Server, Key, ArrowRight, Check } from 'lucide-react';

const OnboardingModal = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3.2');
  const [saving, setSaving] = useState(false);

  const handleProviderSelect = (selectedProvider) => {
    setProvider(selectedProvider);
    setStep(2);
  };

  const handleComplete = async () => {
    try {
      setSaving(true);

      // Save provider settings
      await window.electronAPI.settings.set('llm_provider', provider);

      if (provider === 'openai') {
        if (!apiKey) {
          alert('Please enter your OpenAI API key');
          setSaving(false);
          return;
        }
        await window.electronAPI.settings.set('openai_api_key', apiKey);
      } else if (provider === 'ollama') {
        await window.electronAPI.settings.set('ollama_url', ollamaUrl);
        await window.electronAPI.settings.set('ollama_model', ollamaModel);
      }

      // Mark onboarding as complete
      await window.electronAPI.settings.set('onboarding_complete', 'true');

      // Call the completion handler
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding settings:', error);
      alert('Error saving settings: ' + error.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain size={48} className="text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Bryce's Book Lab
          </h1>
          <p className="text-gray-600">
            Let's configure your AI assistant to get started
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > 1 ? <Check size={16} /> : '1'}
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Step 1: Provider Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Choose your AI Provider
            </h2>

            {/* OpenAI Option */}
            <button
              onClick={() => handleProviderSelect('openai')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200">
                  <Key size={24} className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    OpenAI (Cloud)
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Use OpenAI's GPT-4 model via API. Requires an API key and internet connection.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Most powerful and reliable</li>
                    <li>• Pay-per-use pricing</li>
                    <li>• Requires API key from OpenAI</li>
                  </ul>
                </div>
                <ArrowRight size={20} className="text-gray-400 group-hover:text-primary-600" />
              </div>
            </button>

            {/* Ollama Option */}
            <button
              onClick={() => handleProviderSelect('ollama')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200">
                  <Server size={24} className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ollama (Local)
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Run AI models locally on your machine. Free and private.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Completely free and private</li>
                    <li>• Works offline</li>
                    <li>• Requires Ollama installed locally</li>
                  </ul>
                </div>
                <ArrowRight size={20} className="text-gray-400 group-hover:text-primary-600" />
              </div>
            </button>
          </div>
        )}

        {/* Step 2: Configuration */}
        {step === 2 && provider === 'openai' && (
          <div className="space-y-6">
            <div>
              <button
                onClick={() => setStep(1)}
                className="text-primary-600 hover:text-primary-700 text-sm mb-4"
              >
                ← Back to provider selection
              </button>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Configure OpenAI
              </h2>
              <p className="text-gray-600 mb-6">
                Enter your OpenAI API key to enable AI features
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="input w-full"
                placeholder="sk-..."
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                Get your API key from{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  OpenAI's platform
                </a>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your API key is encrypted and stored securely on your local machine. It's never sent anywhere except to OpenAI's API.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStep(1)}
                className="btn btn-secondary"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                className="btn btn-primary flex items-center gap-2"
                disabled={saving || !apiKey}
              >
                {saving ? 'Saving...' : 'Complete Setup'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && provider === 'ollama' && (
          <div className="space-y-6">
            <div>
              <button
                onClick={() => setStep(1)}
                className="text-primary-600 hover:text-primary-700 text-sm mb-4"
              >
                ← Back to provider selection
              </button>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Configure Ollama
              </h2>
              <p className="text-gray-600 mb-6">
                Connect to your local Ollama server
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ollama Server URL
              </label>
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                className="input w-full"
                placeholder="http://localhost:11434"
              />
              <p className="text-sm text-gray-500 mt-2">
                Default is http://localhost:11434 if Ollama is running locally
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Name
              </label>
              <input
                type="text"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                className="input w-full"
                placeholder="llama3.2"
              />
              <p className="text-sm text-gray-500 mt-2">
                Common models: llama3.2, llama3.1, mistral, qwen2.5
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Prerequisites:</strong> Make sure you have Ollama installed and running.
                Visit{' '}
                <a
                  href="https://ollama.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  ollama.com
                </a>
                {' '}to download and install if you haven't already.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStep(1)}
                className="btn btn-secondary"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                className="btn btn-primary flex items-center gap-2"
                disabled={saving || !ollamaUrl || !ollamaModel}
              >
                {saving ? 'Saving...' : 'Complete Setup'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;

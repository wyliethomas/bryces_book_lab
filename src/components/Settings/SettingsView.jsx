import React, { useState, useEffect } from 'react';
import { Save, Key, User, Server, Brain, Download, Upload } from 'lucide-react';

const SettingsView = () => {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3.2');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedProvider = await window.electronAPI.settings.get('llm_provider');
      const key = await window.electronAPI.settings.get('openai_api_key');
      const author = await window.electronAPI.settings.get('author_name');
      const url = await window.electronAPI.settings.get('ollama_url');
      const model = await window.electronAPI.settings.get('ollama_model');

      if (savedProvider) {
        setProvider(savedProvider);
      }

      // Don't show the encrypted key, just show a placeholder if it exists
      if (key) {
        setApiKey('••••••••••••••••');
      }
      if (author) {
        setAuthorName(author);
      }
      if (url) {
        setOllamaUrl(url);
      }
      if (model) {
        setOllamaModel(model);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);

      // Save provider
      await window.electronAPI.settings.set('llm_provider', provider);

      // Save provider-specific settings
      if (provider === 'openai') {
        // Only save API key if it's not the placeholder
        if (apiKey && apiKey !== '••••••••••••••••') {
          await window.electronAPI.settings.set('openai_api_key', apiKey);
        }
      } else if (provider === 'ollama') {
        await window.electronAPI.settings.set('ollama_url', ollamaUrl);
        await window.electronAPI.settings.set('ollama_model', ollamaModel);
      }

      if (authorName) {
        await window.electronAPI.settings.set('author_name', authorName);
      }

      // Reinitialize AI service with new settings
      await window.electronAPI.settings.reinitializeAI();

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

      alert('Settings saved successfully! AI provider has been updated.');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      setBackingUp(true);
      const result = await window.electronAPI.backup.export();

      if (result.success) {
        alert(`Backup saved successfully!\n\nLocation: ${result.path}`);
      } else if (result.cancelled) {
        // User cancelled, do nothing
      } else {
        alert('Backup failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Error creating backup: ' + error.message);
    } finally {
      setBackingUp(false);
    }
  };

  const handleRestore = async () => {
    const confirmed = confirm(
      'Are you sure you want to restore from a backup?\n\n' +
      'This will replace ALL your current data (books, chapters, notes, topics).\n\n' +
      'The app will restart after restoration.'
    );

    if (!confirmed) return;

    try {
      setRestoring(true);
      const result = await window.electronAPI.backup.import();

      if (result.success) {
        alert('Backup restored successfully! The app will now restart.');
        // App will restart automatically
      } else if (result.cancelled) {
        // User cancelled, do nothing
      } else {
        alert('Restore failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Error restoring backup: ' + error.message);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">
          Configure your application preferences
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* LLM Provider Selection */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-100 rounded">
                <Brain size={20} className="text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Provider</h3>
                <p className="text-sm text-gray-600">
                  Choose your AI language model provider
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: provider === 'openai' ? '#3b82f6' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="provider"
                  value="openai"
                  checked={provider === 'openai'}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Key size={16} />
                    <span className="font-semibold">OpenAI (Cloud)</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Use GPT-4 via OpenAI API - Requires API key
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: provider === 'ollama' ? '#3b82f6' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="provider"
                  value="ollama"
                  checked={provider === 'ollama'}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Server size={16} />
                    <span className="font-semibold">Ollama (Local)</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Run models locally on your machine - Free and private
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* OpenAI Configuration */}
          {provider === 'openai' && (
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-100 rounded">
                  <Key size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">OpenAI API Key</h3>
                  <p className="text-sm text-gray-600">
                    Required for OpenAI features
                  </p>
                </div>
              </div>

              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="input w-full"
                placeholder="sk-..."
              />

              <p className="text-sm text-gray-500 mt-3">
                Get your API key from{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  OpenAI's platform
                </a>
                . Your key is encrypted and stored securely.
              </p>
            </div>
          )}

          {/* Ollama Configuration */}
          {provider === 'ollama' && (
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-100 rounded">
                  <Server size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Ollama Configuration</h3>
                  <p className="text-sm text-gray-600">
                    Configure your local Ollama server
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Server URL
                  </label>
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    className="input w-full"
                    placeholder="http://localhost:11434"
                  />
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
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Make sure Ollama is installed and running.
                  Visit{' '}
                  <a
                    href="https://ollama.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    ollama.com
                  </a>
                  {' '}to download.
                </p>
              </div>
            </div>
          )}

          {/* Backup & Restore */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-100 rounded">
                <Download size={20} className="text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Backup & Data</h3>
                <p className="text-sm text-gray-600">
                  Export or restore your data
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <button
                  onClick={handleBackup}
                  className="btn btn-secondary flex items-center gap-2"
                  disabled={backingUp}
                >
                  <Download size={16} />
                  {backingUp ? 'Creating Backup...' : 'Export Backup'}
                </button>
                <div className="flex-1 text-sm text-gray-600">
                  <p>Save a complete backup of all your books, chapters, notes, and settings to a file.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <button
                  onClick={handleRestore}
                  className="btn btn-secondary flex items-center gap-2"
                  disabled={restoring}
                >
                  <Upload size={16} />
                  {restoring ? 'Restoring...' : 'Import Backup'}
                </button>
                <div className="flex-1 text-sm text-gray-600">
                  <p>Restore your data from a previous backup file. This will replace all current data.</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Create regular backups to protect your work. Store backups in a safe location like cloud storage or an external drive.
              </p>
            </div>
          </div>

          {/* Author Name */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-100 rounded">
                <User size={20} className="text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Author Name</h3>
                <p className="text-sm text-gray-600">
                  Used in PDF generation
                </p>
              </div>
            </div>

            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="input"
              placeholder="Your Name"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            {saved && (
              <span className="text-green-600 flex items-center gap-2">
                <Save size={16} />
                Settings saved!
              </span>
            )}
            <button
              onClick={handleSave}
              className="btn btn-primary flex items-center gap-2"
              disabled={saving}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {/* Information */}
          <div className="card bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">
              About AI Features
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Topic extraction from your notes</li>
              <li>• Automatic chapter outline generation</li>
              <li>• Full chapter content generation</li>
              <li>• Content refinement and improvement</li>
              <li>• Interactive AI writing assistant</li>
            </ul>
          </div>

          {/* Version Info */}
          <div className="text-center text-sm text-gray-500">
            <p>Bryce's Book Lab v1.0.0</p>
            <p className="mt-1">
              Built by PXP with Electron, React, and AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

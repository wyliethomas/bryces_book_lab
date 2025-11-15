import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import OutlineEditor from './OutlineEditor';
import ContentEditor from './ContentEditor';
import AIAssistant from './AIAssistant';
import { Save, Clock } from 'lucide-react';

const ChapterEditor = () => {
  const { selectedChapterId, chapters, updateChapter } = useApp();
  const [chapter, setChapter] = useState(null);
  const [activeTab, setActiveTab] = useState('outline');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  useEffect(() => {
    if (selectedChapterId) {
      const currentChapter = chapters.find((c) => c.id === selectedChapterId);
      setChapter(currentChapter);

      // Set default tab based on chapter status
      if (currentChapter) {
        if (!currentChapter.outline) {
          setActiveTab('outline');
        } else if (!currentChapter.content) {
          setActiveTab('content');
        }
      }
    }
  }, [selectedChapterId, chapters]);

  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  const handleUpdate = async (updates) => {
    if (!chapter) return;

    // Update local state immediately
    setChapter({ ...chapter, ...updates });

    // Clear existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    // Set new auto-save timer (2 seconds debounce)
    const timer = setTimeout(async () => {
      try {
        setSaving(true);
        await updateChapter(chapter.id, updates);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving chapter:', error);
      } finally {
        setSaving(false);
      }
    }, 2000);

    setAutoSaveTimer(timer);
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge badge-draft',
      outline: 'badge badge-outline',
      complete: 'badge badge-complete',
    };
    const labels = {
      draft: 'Draft',
      outline: 'Outlined',
      complete: 'Complete',
    };
    return (
      <span className={badges[status] || badges.draft}>
        {labels[status] || 'Draft'}
      </span>
    );
  };

  const getWordCount = (html) => {
    if (!html) return 0;
    const text = html.replace(/<[^>]*>/g, ' ');
    const words = text.trim().split(/\s+/);
    return words.filter((w) => w.length > 0).length;
  };

  if (!chapter) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <input
              type="text"
              value={chapter.title}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              className="text-2xl font-bold border-none outline-none w-full focus:ring-0 p-0"
              placeholder="Chapter Title"
            />
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(chapter.status)}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {saving ? (
                <>
                  <Save size={16} className="animate-pulse" />
                  <span>Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Clock size={16} />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </>
              ) : null}
            </div>
            <div className="text-sm text-gray-500">
              {getWordCount(chapter.content)} words
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('outline')}
            className={`px-4 py-2 font-medium rounded-t transition-colors ${
              activeTab === 'outline'
                ? 'bg-gray-100 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Outline
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 font-medium rounded-t transition-colors ${
              activeTab === 'content'
                ? 'bg-gray-100 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 font-medium rounded-t transition-colors ${
              activeTab === 'ai'
                ? 'bg-gray-100 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            AI Assistant
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'outline' && (
          <OutlineEditor chapter={chapter} onUpdate={handleUpdate} />
        )}
        {activeTab === 'content' && (
          <ContentEditor chapter={chapter} onUpdate={handleUpdate} />
        )}
        {activeTab === 'ai' && (
          <AIAssistant chapter={chapter} onUpdate={handleUpdate} />
        )}
      </div>
    </div>
  );
};

export default ChapterEditor;

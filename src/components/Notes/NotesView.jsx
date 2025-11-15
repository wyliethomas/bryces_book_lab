import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, Tag as TagIcon } from 'lucide-react';

const NotesView = () => {
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState('');
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    loadNotes();
    loadTopics();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await window.electronAPI.notes.getAll();
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const loadTopics = async () => {
    try {
      const data = await window.electronAPI.topics.getAll();
      setTopics(data);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  const handleProcessNotes = async () => {
    if (!noteText.trim()) return;

    try {
      setProcessing(true);
      const result = await window.electronAPI.notes.processNotes(noteText);

      alert(
        `Success! Processed ${result.processedCount} notes and extracted ${
          result.results.reduce((acc, r) => acc + r.topics.length, 0)
        } topic associations.`
      );

      setNoteText('');
      await loadNotes();
      await loadTopics();
    } catch (error) {
      console.error('Error processing notes:', error);
      alert('Error processing notes: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const filteredNotes = filter
    ? notes.filter((note) => note.topics && note.topics.includes(filter))
    : notes;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
        <p className="text-gray-600 mt-1">
          Upload your notes and AI will automatically extract topics
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Upload Section */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Add Notes</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="textarea mb-3"
              rows="8"
              placeholder="Paste your notes here. Separate different ideas with blank lines.

Example:
Artificial intelligence has revolutionized many industries. Machine learning algorithms can now perform tasks that previously required human intelligence.

The publishing industry has seen significant changes with digital distribution. E-books and audiobooks have become mainstream formats."
              disabled={processing}
            />
            <button
              onClick={handleProcessNotes}
              className="btn btn-primary flex items-center gap-2"
              disabled={processing || !noteText.trim()}
            >
              {processing ? (
                <>
                  <Sparkles size={20} className="animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Process Notes
                </>
              )}
            </button>
            {processing && (
              <p className="text-sm text-gray-500 mt-2">
                AI is analyzing your notes and extracting topics...
              </p>
            )}
          </div>

          {/* Filter */}
          {topics.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">
                Filter by topic:
              </span>
              <button
                onClick={() => setFilter('')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === ''
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setFilter(topic.name)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filter === topic.name
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {topic.name} ({topic.note_count})
                </button>
              ))}
            </div>
          )}

          {/* Notes List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">
              All Notes ({filteredNotes.length})
            </h3>
            {filteredNotes.length === 0 ? (
              <div className="card text-center py-8 text-gray-500">
                <p>No notes yet. Add some notes above to get started.</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div key={note.id} className="card">
                  <p className="text-gray-800 mb-2">{note.content}</p>
                  {note.topics && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <TagIcon size={14} className="text-gray-400" />
                      {note.topics.split(',').map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesView;

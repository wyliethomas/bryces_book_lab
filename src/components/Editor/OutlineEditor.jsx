import React, { useState } from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';

const OutlineEditor = ({ chapter, onUpdate }) => {
  const [refining, setRefining] = useState(false);
  const [refineInstructions, setRefineInstructions] = useState('');
  const [showRefineModal, setShowRefineModal] = useState(false);

  const handleRefine = async () => {
    if (!refineInstructions.trim()) return;

    try {
      setRefining(true);
      const refinedOutline = await window.electronAPI.ai.refineOutline(
        chapter.outline,
        refineInstructions
      );
      onUpdate({ outline: refinedOutline });
      setShowRefineModal(false);
      setRefineInstructions('');
    } catch (error) {
      console.error('Error refining outline:', error);
    } finally {
      setRefining(false);
    }
  };

  const handleApprove = () => {
    onUpdate({ status: 'outline' });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-4xl mx-auto">
          {!chapter.outline ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                No outline yet. Create a chapter with a topic to automatically
                generate an outline, or write your own below.
              </p>
            </div>
          ) : null}

          <textarea
            value={chapter.outline || ''}
            onChange={(e) => onUpdate({ outline: e.target.value })}
            className="textarea font-mono text-sm"
            rows="20"
            placeholder="Write your chapter outline here...

Example structure:

Introduction
- Key point 1
- Key point 2

Section 1: Main Topic
- Subtopic A
- Subtopic B

Section 2: Details
- Point 1
- Point 2

Conclusion
- Summary
- Call to action"
          />

          {chapter.outline && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowRefineModal(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Sparkles size={16} />
                Refine with AI
              </button>
              {chapter.status === 'draft' && (
                <button
                  onClick={handleApprove}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Approve Outline
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Refine Modal */}
      {showRefineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Refine Outline</h3>
            <textarea
              value={refineInstructions}
              onChange={(e) => setRefineInstructions(e.target.value)}
              className="textarea mb-4"
              rows="4"
              placeholder="What would you like to change about the outline?"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRefineModal(false)}
                className="btn btn-secondary"
                disabled={refining}
              >
                Cancel
              </button>
              <button
                onClick={handleRefine}
                className="btn btn-primary flex items-center gap-2"
                disabled={refining || !refineInstructions.trim()}
              >
                {refining ? (
                  <>
                    <Sparkles size={16} className="animate-pulse" />
                    Refining...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Refine
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutlineEditor;

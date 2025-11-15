import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, FileText } from 'lucide-react';
import ChapterItem from './ChapterItem';
import ChapterForm from './ChapterForm';
import PDFGenerator from './PDFGenerator';

const ChapterList = () => {
  const { chapters, selectedBookId, selectedChapterId, selectChapter } = useApp();
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Chapters</h2>
          <button
            onClick={() => setShowChapterForm(true)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="New Chapter"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Chapters List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {chapters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No chapters yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <ChapterItem
                key={chapter.id}
                chapter={chapter}
                isSelected={selectedChapterId === chapter.id}
                onClick={() => selectChapter(chapter.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* PDF Generation Button */}
      {chapters.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowPDFGenerator(true)}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            <FileText size={18} />
            Generate PDF
          </button>
        </div>
      )}

      {/* Chapter Form Modal */}
      {showChapterForm && (
        <ChapterForm
          bookId={selectedBookId}
          onClose={() => setShowChapterForm(false)}
          onSuccess={() => setShowChapterForm(false)}
        />
      )}

      {/* PDF Generator Modal */}
      {showPDFGenerator && (
        <PDFGenerator
          bookId={selectedBookId}
          onClose={() => setShowPDFGenerator(false)}
        />
      )}
    </>
  );
};

export default ChapterList;

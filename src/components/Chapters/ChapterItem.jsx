import React from 'react';

const ChapterItem = ({ chapter, isSelected, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500';
      case 'outline':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'outline':
        return 'Outlined';
      default:
        return 'Draft';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-colors ${
        isSelected
          ? 'bg-primary-50 border-2 border-primary-500'
          : 'bg-white border-2 border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getStatusColor(
            chapter.status
          )}`}
          title={getStatusLabel(chapter.status)}
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 mb-0.5">
            Chapter {chapter.chapter_number}
          </div>
          <div className="font-medium text-sm text-gray-900 line-clamp-2">
            {chapter.title}
          </div>
        </div>
      </div>
    </button>
  );
};

export default ChapterItem;

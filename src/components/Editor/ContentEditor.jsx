import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Sparkles, Bold, Italic, Underline as UnderlineIcon, List, ListOrdered } from 'lucide-react';

const ContentEditor = ({ chapter, onUpdate }) => {
  const [generating, setGenerating] = useState(false);
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [refineInstructions, setRefineInstructions] = useState('');
  const [selectedText, setSelectedText] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your chapter content...',
      }),
    ],
    content: chapter.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate({ content: html });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor && chapter.content !== editor.getHTML()) {
      editor.commands.setContent(chapter.content || '');
    }
  }, [chapter.content, editor]);

  const handleGenerateContent = async () => {
    if (!chapter.outline) {
      alert('Please create and approve an outline first');
      return;
    }

    try {
      setGenerating(true);

      // Get notes related to this chapter (you might want to improve this logic)
      const allTopics = await window.electronAPI.topics.getAll();
      let allNotes = [];

      // Get notes from all topics (in a real app, you'd want to be more selective)
      for (const topic of allTopics.slice(0, 3)) {
        const notes = await window.electronAPI.topics.getNotesByTopic(topic.id);
        allNotes = [...allNotes, ...notes];
      }

      const content = await window.electronAPI.ai.generateChapter(
        chapter.outline,
        allNotes
      );

      if (editor) {
        editor.commands.setContent(content);
      }

      onUpdate({ content: content, status: 'complete' });
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Error generating content: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRefineSelection = () => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');

    if (text.trim().length === 0) {
      alert('Please select some text to refine');
      return;
    }

    setSelectedText(text);
    setShowRefineModal(true);
  };

  const handleRefine = async () => {
    if (!refineInstructions.trim() || !editor) return;

    try {
      setGenerating(true);
      const refined = await window.electronAPI.ai.refineContent(
        selectedText,
        refineInstructions
      );

      // Replace selected text with refined version
      const { from, to } = editor.state.selection;
      editor.chain().focus().deleteRange({ from, to }).insertContent(refined).run();

      setShowRefineModal(false);
      setRefineInstructions('');
      setSelectedText('');
    } catch (error) {
      console.error('Error refining content:', error);
      alert('Error refining content: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white px-6 py-3 flex items-center gap-2">
        <button
          onClick={handleGenerateContent}
          className="btn btn-primary btn-sm flex items-center gap-2"
          disabled={generating || !chapter.outline}
        >
          {generating ? (
            <>
              <Sparkles size={16} className="animate-pulse" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Chapter Content
            </>
          )}
        </button>

        <button
          onClick={handleRefineSelection}
          className="btn btn-secondary btn-sm flex items-center gap-2"
          disabled={generating}
        >
          <Sparkles size={16} />
          Refine Selection
        </button>

        <div className="flex-1"></div>

        {/* Format buttons */}
        <div className="flex gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-100 ${
              editor.isActive('bold') ? 'bg-gray-200' : ''
            }`}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-100 ${
              editor.isActive('italic') ? 'bg-gray-200' : ''
            }`}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-100 ${
              editor.isActive('underline') ? 'bg-gray-200' : ''
            }`}
            title="Underline"
          >
            <UnderlineIcon size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-100 ${
              editor.isActive('bulletList') ? 'bg-gray-200' : ''
            }`}
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-100 ${
              editor.isActive('orderedList') ? 'bg-gray-200' : ''
            }`}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {editor && (
            <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
              <div className="bubble-menu">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={editor.isActive('bold') ? 'is-active' : ''}
                >
                  Bold
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={editor.isActive('italic') ? 'is-active' : ''}
                >
                  Italic
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={editor.isActive('underline') ? 'is-active' : ''}
                >
                  Underline
                </button>
              </div>
            </BubbleMenu>
          )}

          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Refine Modal */}
      {showRefineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Refine Selection</h3>
            <p className="text-sm text-gray-600 mb-4">
              Selected: "{selectedText.substring(0, 100)}..."
            </p>
            <textarea
              value={refineInstructions}
              onChange={(e) => setRefineInstructions(e.target.value)}
              className="textarea mb-4"
              rows="4"
              placeholder="How should I improve this text?"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRefineModal(false)}
                className="btn btn-secondary"
                disabled={generating}
              >
                Cancel
              </button>
              <button
                onClick={handleRefine}
                className="btn btn-primary flex items-center gap-2"
                disabled={generating || !refineInstructions.trim()}
              >
                {generating ? (
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

export default ContentEditor;

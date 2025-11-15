import React, { useState } from 'react';
import { X, FileText, CheckCircle } from 'lucide-react';

const PDFGenerator = ({ bookId, onClose }) => {
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pdfPath, setPdfPath] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError('');

      const result = await window.electronAPI.pdf.generateBook(bookId);

      if (result.success) {
        setSuccess(true);
        setPdfPath(result.path);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  const openPDF = () => {
    // Use electron shell to open the PDF
    if (pdfPath) {
      window.electronAPI.shell?.openPath(pdfPath);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Generate PDF</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={generating}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!generating && !success && !error && (
            <div className="text-center">
              <FileText size={48} className="mx-auto text-primary-600 mb-4" />
              <p className="text-gray-700 mb-6">
                Generate a professional PDF of your book with all chapters,
                including a cover page and table of contents.
              </p>
              <button
                onClick={handleGenerate}
                className="btn btn-primary w-full"
              >
                Generate PDF
              </button>
            </div>
          )}

          {generating && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-700">Generating PDF...</p>
              <p className="text-sm text-gray-500 mt-2">
                This may take a few moments
              </p>
            </div>
          )}

          {success && (
            <div className="text-center">
              <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
              <p className="text-gray-700 mb-2">PDF generated successfully!</p>
              <p className="text-sm text-gray-500 mb-6">
                Saved to your Downloads folder
              </p>
              <div className="space-y-2">
                <button onClick={openPDF} className="btn btn-primary w-full">
                  Open PDF
                </button>
                <button onClick={onClose} className="btn btn-secondary w-full">
                  Close
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <X size={48} className="mx-auto" />
              </div>
              <p className="text-red-700 mb-6">{error}</p>
              <button onClick={onClose} className="btn btn-secondary w-full">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;

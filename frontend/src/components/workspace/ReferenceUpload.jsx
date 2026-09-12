import React, { useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

export default function ReferenceUpload({ attachment, onSelect, onClose }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (cap at 5MB as per blueprint)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      return;
    }

    onSelect(file);
  };

  return (
    <div className="p-4 bg-dark-800 border border-dark-600 rounded-xl relative">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Upload className="w-3.5 h-3.5 text-blue-400" /> Reference Attachment (Optional)
      </div>
      <p className="text-xs text-gray-400 mb-3">
        Upload a problem screenshot, assignment image, or text file.
      </p>

      {attachment ? (
        <div className="flex items-center justify-between p-2.5 bg-dark-900 rounded-lg border border-dark-600">
          <div className="flex items-center gap-2 overflow-hidden">
            {attachment.type?.startsWith('image/') ? (
              <ImageIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
            <span className="text-xs text-gray-200 truncate">{attachment.name}</span>
            <span className="text-[10px] text-gray-500 flex-shrink-0">
              ({(attachment.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-xs text-red-400 hover:text-red-300 ml-2"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-dark-600 hover:border-blue-500/50 rounded-lg p-4 text-center cursor-pointer transition bg-dark-900/50 hover:bg-dark-900"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,text/plain"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="w-5 h-5 text-gray-500 mx-auto mb-1" />
          <p className="text-xs text-gray-300 font-medium">Click to upload reference file</p>
          <p className="text-[11px] text-gray-500">PNG, JPG, or TXT up to 5MB</p>
        </div>
      )}
    </div>
  );
}

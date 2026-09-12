import React from 'react';
import { Upload, X, FileText, Image as ImageIcon, FileCode, Sliders } from 'lucide-react';

const REFERENCE_MODES = [
  { id: 'convert', label: 'Convert Exact', desc: 'Preserves exact requirements & tests' },
  { id: 'variant', label: 'Same Concept (Variant)', desc: 'Tests same concept in a new storyline' },
  { id: 'harder', label: 'Make Harder', desc: 'Elevates constraints & boundaries' },
  { id: 'easier', label: 'Make Easier', desc: 'Approachable simplified variation' },
  { id: 'inspiration', label: 'Inspiration Only', desc: 'Thematic context without copying' },
];

export default function ReferenceUpload({
  attachment,
  onSelect,
  referenceMode = 'convert',
  onModeChange,
  onClose,
}) {
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
    <div className="p-4 bg-dark-800 border border-dark-600 rounded-xl relative space-y-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
      >
        <X className="w-4 h-4" />
      </button>

      <div>
        <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5 text-blue-400" /> Reference Attachment (Optional)
        </div>
        <p className="text-xs text-gray-400">
          Upload an assignment screenshot, problem image, text file, or PDF document.
        </p>
      </div>

      {attachment ? (
        <div className="flex items-center justify-between p-3 bg-dark-900 rounded-lg border border-dark-600">
          <div className="flex items-center gap-3 overflow-hidden">
            {attachment.type?.startsWith('image/') ? (
              <div className="w-9 h-9 rounded-md overflow-hidden bg-dark-950 flex-shrink-0 border border-dark-700 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-blue-400" />
              </div>
            ) : attachment.type === 'application/pdf' ? (
              <div className="w-9 h-9 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-500/20">
                <FileCode className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                <FileText className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-xs font-medium text-gray-200 truncate block">
                {attachment.name}
              </span>
              <span className="text-[10px] text-gray-500 block">
                {(attachment.size / 1024).toFixed(1)} KB • {attachment.type || 'Document'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded hover:bg-red-500/10 transition ml-2"
          >
            Remove
          </button>
        </div>
      ) : (
        <div>
          <input
            id="reference-file-input"
            type="file"
            accept="image/png,image/jpeg,image/webp,text/plain,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="reference-file-input"
            className="block w-full border border-dashed border-dark-600 hover:border-blue-500/50 rounded-lg p-4 text-center cursor-pointer transition bg-dark-900/50 hover:bg-dark-900"
          >
            <Upload className="w-5 h-5 text-gray-500 mx-auto mb-1" />
            <span className="block text-xs text-gray-300 font-medium">Click to upload reference file</span>
            <span className="block text-[11px] text-gray-500">PNG, JPG, WEBP, TXT, or PDF up to 5MB</span>
          </label>
        </div>
      )}

      {/* Reference Mode Selector */}
      <div className="pt-2 border-t border-dark-700/60">
        <div className="flex items-center gap-1.5 text-xs text-gray-300 font-medium mb-2">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Reference Mode:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {REFERENCE_MODES.map((mode) => {
            const isSelected = referenceMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onModeChange && onModeChange(mode.id)}
                className={`text-left px-2.5 py-1.5 rounded-lg border transition text-xs ${
                  isSelected
                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-200 shadow-sm'
                    : 'bg-dark-900/60 border-dark-700 text-gray-400 hover:text-gray-200 hover:bg-dark-900'
                }`}
              >
                <div className="font-medium text-[11px] leading-tight flex items-center justify-between">
                  <span>{mode.label}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                </div>
                <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
                  {mode.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

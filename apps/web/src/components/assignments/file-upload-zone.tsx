'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { Upload, File as FileIcon, X } from 'lucide-react';

interface FileUploadZoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  className?: string;
}

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED = 'application/pdf,text/plain,image/png,image/jpeg';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadZone({ file, onFileChange, className }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (f: File) => {
      if (f.size > MAX_SIZE) {
        alert('File size exceeds 10MB limit');
        return;
      }
      onFileChange(f);
    },
    [onFileChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  return (
    <div className={className}>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'rounded-3xl border-[1.75px] border-dashed p-6 flex flex-col items-center gap-3 transition-colors duration-200',
          isDragging
            ? 'border-accent bg-accent/5'
            : 'border-black/20 bg-surface-soft',
        )}
      >
        {file ? (
          <div className="flex items-center gap-3 w-full">
            <div className="h-10 w-10 rounded-lg bg-surface flex items-center justify-center shrink-0">
              <FileIcon size={20} className="text-text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
              <p className="text-xs text-text-muted">{formatSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => onFileChange(null)}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Remove file"
            >
              <X size={16} className="text-text-muted" />
            </button>
          </div>
        ) : (
          <>
            <div className="h-10 w-10 rounded-lg bg-surface flex items-center justify-center">
              <Upload size={20} className="text-text-muted" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-text-primary">
                Choose a file or drag &amp; drop it here
              </p>
              <p className="text-xs text-text-muted mt-1">
                PDF, TXT, JPEG, PNG, upto 10MB
              </p>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="border border-black/20 rounded-full px-5 h-9 text-sm font-medium text-text-primary hover:bg-black/5 transition-colors cursor-pointer"
            >
              Browse Files
            </button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={handleChange}
          className="hidden"
        />
      </div>
      <p className="mt-2 text-xs text-text-muted text-center">
        Upload images or documents for better AI-generated questions
      </p>
    </div>
  );
}

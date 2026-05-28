'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, ArrowLeft, Loader2, Check, AlertCircle } from 'lucide-react';
import {
  startPdfGeneration,
  getPdfState,
  getPdfDownloadUrl,
} from '@/lib/api-client';

interface OutputActionBannerProps {
  assignmentId: string;
  className_: string;
  subject: string;
  topic: string;
  onRegenerate: () => Promise<void>;
}

type PdfButtonState = 'idle' | 'preparing' | 'ready' | 'error';

export function OutputActionBanner({
  assignmentId,
  className_,
  subject,
  topic,
  onRegenerate,
}: OutputActionBannerProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [pdfState, setPdfState] = useState<PdfButtonState>('idle');
  const [pdfError, setPdfError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleRegenerate() {
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  }

  const triggerDownload = useCallback(() => {
    const url = getPdfDownloadUrl(assignmentId);
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [assignmentId]);

  const handleDownloadPdf = useCallback(async () => {
    setPdfState('preparing');
    setPdfError('');

    try {
      const result = await startPdfGeneration(assignmentId);

      if (result.status === 'ready') {
        setPdfState('ready');
        triggerDownload();
        setTimeout(() => setPdfState('idle'), 3000);
        return;
      }

      // Poll for completion
      pollRef.current = setInterval(async () => {
        try {
          const state = await getPdfState(assignmentId);
          if (!state) return;

          if (state.status === 'ready') {
            if (pollRef.current) clearInterval(pollRef.current);
            setPdfState('ready');
            triggerDownload();
            setTimeout(() => setPdfState('idle'), 3000);
          } else if (state.status === 'failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setPdfState('error');
            setPdfError(state.error || 'PDF generation failed');
          }
        } catch {
          if (pollRef.current) clearInterval(pollRef.current);
          setPdfState('error');
          setPdfError('Failed to check PDF status');
        }
      }, 1500);
    } catch (err) {
      setPdfState('error');
      setPdfError(err instanceof Error ? err.message : 'Failed to start PDF generation');
    }
  }, [assignmentId, triggerDownload]);

  const pdfButtonContent = () => {
    switch (pdfState) {
      case 'preparing':
        return (
          <>
            <Loader2 size={14} className="animate-spin" />
            Preparing PDF...
          </>
        );
      case 'ready':
        return (
          <>
            <Check size={14} />
            Downloaded!
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle size={14} />
            Retry Download
          </>
        );
      default:
        return (
          <>
            <Download size={14} />
            Download as PDF
          </>
        );
    }
  };

  return (
    <div className="rounded-3xl bg-[#181818]/90 backdrop-blur-sm p-5 lg:p-8">
      {/* Back link */}
      <Link
        href="/assignments"
        className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Back to Assignments
      </Link>

      {/* Banner text */}
      <p className="text-white text-sm lg:text-base leading-relaxed">
        Certainly! Here is your customized Question Paper for your{' '}
        <span className="font-semibold text-white">{className_} {subject}</span> class on the{' '}
        <span className="font-semibold text-white">{topic}</span> chapters:
      </p>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3 mt-5">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-white/20 text-white hover:bg-white/10 hover:border-white/30"
          icon={isRegenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          onClick={handleRegenerate}
          disabled={isRegenerating}
        >
          {isRegenerating ? 'Regenerating...' : 'Regenerate'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`rounded-full border-white/20 text-white hover:bg-white/10 hover:border-white/30 ${
            pdfState === 'ready' ? 'border-green-400/40 text-green-300' : ''
          } ${pdfState === 'error' ? 'border-red-400/40 text-red-300' : ''}`}
          onClick={handleDownloadPdf}
          disabled={pdfState === 'preparing'}
        >
          {pdfButtonContent()}
        </Button>
      </div>

      {/* Error message */}
      {pdfState === 'error' && pdfError && (
        <p className="text-xs text-red-300/70 mt-2">{pdfError}</p>
      )}
    </div>
  );
}

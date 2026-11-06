import React, { useMemo, useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  HardDrive,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Maximize2
} from 'lucide-react';
import {
  isGoogleDriveUrl,
  getDrivePreviewEmbedUrl,
  isPdfDocument,
  isImageDocument,
  getDocumentPreviewImage,
  dataUrlToBlobUrl,
  downloadDocument,
  openDocumentInNewTab
} from '../utils/fileDownloader';

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileUrlOrBase64: string;
  fileName?: string;
  driveUrl?: string;
  categoryLabel?: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  fileUrlOrBase64,
  fileName,
  driveUrl,
  categoryLabel = 'Dokumen Lampiran'
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  // Determine actual file source
  const activeUrl = fileUrlOrBase64 || driveUrl || '';

  // Priority 1: Check if there is an image directly, or an extracted JPEG/PNG from a scanned PDF, or Drive thumbnail
  const previewImg = useMemo(() => {
    if (!activeUrl) return null;
    return getDocumentPreviewImage(activeUrl) || (driveUrl ? getDocumentPreviewImage(driveUrl) : null);
  }, [activeUrl, driveUrl]);

  // Generate safe blob URL for rendering if base64 data
  const safeBlobUrl = useMemo(() => {
    if (!activeUrl) return '';
    return dataUrlToBlobUrl(activeUrl);
  }, [activeUrl]);

  if (!isOpen || !activeUrl) return null;

  const isDrive = isGoogleDriveUrl(activeUrl) || isGoogleDriveUrl(driveUrl);
  const isPdf = isPdfDocument(activeUrl);
  const isImg = isImageDocument(activeUrl) || !!previewImg;
  const driveEmbedUrl = isDrive ? getDrivePreviewEmbedUrl(driveUrl || activeUrl) : '';
  const displayFileName =
    fileName ||
    `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}${isPdf && !previewImg ? '.pdf' : '.png'}`;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 25, 250));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 25, 50));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleResetZoom = () => {
    setZoomLevel(100);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh] animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              {isImg ? (
                <Maximize2 className="w-5 h-5" />
              ) : isPdf ? (
                <FileText className="w-5 h-5" />
              ) : isDrive ? (
                <HardDrive className="w-5 h-5 text-emerald-400" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  {categoryLabel}
                </span>
                {isDrive && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <HardDrive className="w-2.5 h-2.5" />
                    <span>Google Drive</span>
                  </span>
                )}
                <span className="text-[10px] font-mono text-slate-400">
                  {previewImg ? 'Pratinjau Visual / Gambar Dokumen' : isPdf ? 'Format PDF Digital' : 'Dokumen Terlampir'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1 truncate max-w-md sm:max-w-xl">
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Controls for Image Preview (Zoom In, Zoom Out, Rotate, Reset) */}
        {previewImg && (
          <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0">
            <span className="text-[11px] text-slate-400">
              Skala: <strong className="text-amber-400 font-mono">{zoomLevel}%</strong> • Rotasi: <strong className="text-amber-400 font-mono">{rotation}°</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg border border-slate-700 cursor-pointer"
                title="Perkecil (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 250}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg border border-slate-700 cursor-pointer"
                title="Perbesar (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRotate}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 cursor-pointer"
                title="Putar 90°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium rounded-lg border border-slate-700 cursor-pointer flex items-center gap-1"
                title="Reset Ukuran"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Document Viewport */}
        <div className="p-3 sm:p-5 flex-1 overflow-auto bg-slate-950/80 flex items-center justify-center min-h-[380px] max-h-[70vh]">
          {previewImg ? (
            /* High-resolution Image preview (direct image or extracted from scanned PDF) */
            <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
              <img
                src={previewImg}
                alt={title}
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.15s ease-out'
                }}
                className="max-h-[62vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-slate-800 origin-center"
              />
            </div>
          ) : isPdf ? (
            /* Dedicated interactive PDF display (avoids blank white iframes) */
            <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-5 shadow-2xl my-auto">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-inner">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">
                  {displayFileName}
                </h4>
                <p className="text-xs text-slate-400">
                  Dokumen digital PDF tersimpan aman dan siap dibuka di tab baru atau diunduh ke komputer.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => openDocumentInNewTab(activeUrl)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka PDF di Tab Baru (Layar Penuh)</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadDocument(activeUrl, displayFileName)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File PDF</span>
                </button>
              </div>
            </div>
          ) : isDrive && driveEmbedUrl ? (
            /* Embedded Google Drive Document Preview with external fallback */
            <div className="w-full h-[62vh] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner relative">
              <iframe
                src={driveEmbedUrl}
                title={title}
                className="w-full h-full rounded-xl border-0"
                allow="autoplay"
              />
            </div>
          ) : (
            /* Generic document view */
            <div className="py-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-amber-400">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{displayFileName}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Berkas digital terlampir dan tersimpan aman di sistem.
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadDocument(activeUrl, displayFileName)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas Ini</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 truncate max-w-sm">
            <span className="font-semibold text-slate-300">Berkas:</span>
            <span className="truncate font-mono">{displayFileName}</span>
          </div>

          <div className="flex items-center gap-2">
            {(driveUrl || activeUrl.startsWith('http')) && (
              <button
                type="button"
                onClick={() => openDocumentInNewTab(driveUrl || activeUrl)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                title="Buka Dokumen di Google Drive atau Tautan Asli"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isDrive ? 'Buka Google Drive' : 'Buka Tab Baru'}</span>
              </button>
            )}

            {!isDrive && (
              <button
                type="button"
                onClick={() => openDocumentInNewTab(activeUrl)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                title="Buka Dokumen di Tab Baru"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>Tab Baru</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => downloadDocument(activeUrl, displayFileName)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              title="Unduh Berkas ke Komputer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Dokumen</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

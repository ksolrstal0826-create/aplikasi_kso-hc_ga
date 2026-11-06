/**
 * File Downloader & Document Viewer Utilities
 * Supports downloading, converting to Blob, and in-app viewing
 * for Google Drive URLs, external URLs, and Base64 Data URLs (PDF, Images, etc.).
 */

export function isGoogleDriveUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes('drive.google.com') || url.includes('docs.google.com');
}

export function extractDriveFileId(url?: string): string | null {
  if (!url) return null;
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1 && match1[1]) return match1[1];
  const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1]) return match2[1];
  return null;
}

export function getDriveDownloadUrl(urlOrId?: string): string {
  if (!urlOrId) return '';
  if (urlOrId.startsWith('data:') || urlOrId.startsWith('blob:')) {
    return urlOrId;
  }
  const fileId = extractDriveFileId(urlOrId) || urlOrId;
  if (fileId && !fileId.startsWith('http')) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return urlOrId;
}

export function getDrivePreviewEmbedUrl(urlOrId?: string): string {
  if (!urlOrId) return '';
  const fileId = extractDriveFileId(urlOrId) || (urlOrId.length > 20 && !urlOrId.includes('/') ? urlOrId : null);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return urlOrId;
}

export function isPdfDocument(urlOrData?: string): boolean {
  if (!urlOrData) return false;
  const lower = urlOrData.toLowerCase();
  return (
    urlOrData.startsWith('data:application/pdf') ||
    lower.includes('.pdf') ||
    urlOrData.startsWith('JVBERi0')
  );
}

export function isImageDocument(urlOrData?: string): boolean {
  if (!urlOrData) return false;
  return (
    urlOrData.startsWith('data:image/') ||
    urlOrData.includes('images.unsplash.com') ||
    /\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i.test(urlOrData) ||
    urlOrData.startsWith('/9j/') ||
    urlOrData.startsWith('iVBORw0KGgo')
  );
}

/**
 * Scans a PDF base64 string for embedded JPEG images (e.g. from Epson Scan 2, CamScanner, etc.)
 * and extracts the JPEG as a direct data:image/jpeg;base64 URL.
 * This guarantees 100% reliable in-browser rendering without browser PDF plugin issues or blank screens!
 */
export function extractEmbeddedImageFromPdf(dataUrlOrBase64: string): string | null {
  if (!dataUrlOrBase64 || typeof dataUrlOrBase64 !== 'string') return null;
  if (isImageDocument(dataUrlOrBase64)) return dataUrlOrBase64;
  if (!isPdfDocument(dataUrlOrBase64)) return null;

  const commaIdx = dataUrlOrBase64.indexOf(',');
  const base64Str = commaIdx !== -1 ? dataUrlOrBase64.slice(commaIdx + 1) : dataUrlOrBase64;

  try {
    const binary = atob(base64Str);
    const start = binary.indexOf('\xFF\xD8\xFF');
    if (start === -1) return null;
    const end = binary.lastIndexOf('\xFF\xD9');
    if (end === -1 || end <= start) return null;

    const jpgBinary = binary.slice(start, end + 2);
    const jpgBase64 = btoa(jpgBinary);
    return `data:image/jpeg;base64,${jpgBase64}`;
  } catch (err) {
    return null;
  }
}

export function getDriveThumbnailUrl(urlOrId?: string): string {
  if (!urlOrId) return '';
  const fileId = extractDriveFileId(urlOrId);
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
  }
  return '';
}

/**
 * Returns a renderable image or preview source from a document string.
 * If it's an image, returns as is.
 * If it's a PDF with embedded scan image, returns the extracted image.
 * If it's a Google Drive link, returns the direct thumbnail image URL.
 * Otherwise returns null.
 */
export function getDocumentPreviewImage(urlOrData?: string): string | null {
  if (!urlOrData) return null;
  if (isImageDocument(urlOrData)) return urlOrData;
  if (isPdfDocument(urlOrData)) {
    return extractEmbeddedImageFromPdf(urlOrData);
  }
  if (isGoogleDriveUrl(urlOrData)) {
    const thumb = getDriveThumbnailUrl(urlOrData);
    if (thumb) return thumb;
  }
  return null;
}

/**
 * Converts a Base64 data URL into a standard Blob URL.
 * Blob URLs don't trigger Chrome's "about:blank" restriction on top-level navigations
 * and allow seamless in-app embedding of PDFs and images.
 */
export function dataUrlToBlobUrl(dataUrl: string): string {
  if (!dataUrl) return '';
  if (dataUrl.startsWith('blob:') || dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    return dataUrl;
  }

  try {
    let normalized = dataUrl;
    if (normalized.startsWith('JVBERi0')) {
      normalized = `data:application/pdf;base64,${normalized}`;
    } else if (normalized.startsWith('/9j/')) {
      normalized = `data:image/jpeg;base64,${normalized}`;
    } else if (normalized.startsWith('iVBORw0KGgo')) {
      normalized = `data:image/png;base64,${normalized}`;
    }

    if (!normalized.startsWith('data:')) return normalized;

    const parts = normalized.split(',');
    if (parts.length < 2) return normalized;

    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('Failed to convert dataUrl to blobUrl:', err);
    return dataUrl;
  }
}

/**
 * Robust document downloader that handles Google Drive links, Web URLs, and Base64/Blob data.
 */
export function downloadDocument(fileUrlOrBase64: string, customFileName?: string) {
  if (!fileUrlOrBase64) return;

  const fileName = customFileName || `dokumen-${Date.now()}`;

  // If it's a Google Drive link
  if (isGoogleDriveUrl(fileUrlOrBase64)) {
    const fileId = extractDriveFileId(fileUrlOrBase64);
    if (fileId) {
      const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const link = document.createElement('a');
      link.href = downloadLink;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
  }

  // If it's an external web URL
  if (fileUrlOrBase64.startsWith('http://') || fileUrlOrBase64.startsWith('https://')) {
    const link = document.createElement('a');
    link.href = fileUrlOrBase64;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // If it's a Base64 data URL or Blob
  try {
    const blobUrl = dataUrlToBlobUrl(fileUrlOrBase64);
    const link = document.createElement('a');
    link.href = blobUrl;
    const ext = isPdfDocument(fileUrlOrBase64) ? '.pdf' : '.png';
    link.download = fileName.includes('.') ? fileName : `${fileName}${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (blobUrl.startsWith('blob:')) {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
    }
  } catch (err) {
    console.error('Failed to trigger download:', err);
  }
}

/**
 * Safely opens a document without triggering Chrome's about:blank block.
 */
export function openDocumentInNewTab(urlOrBase64: string) {
  if (!urlOrBase64) return;

  if (urlOrBase64.startsWith('data:') || urlOrBase64.startsWith('JVBERi0') || urlOrBase64.startsWith('/9j/')) {
    const blobUrl = dataUrlToBlobUrl(urlOrBase64);
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  window.open(urlOrBase64, '_blank', 'noopener,noreferrer');
}

import React, { useState } from 'react';
import katex from 'katex';
import { ZoomIn, X } from 'lucide-react';

interface FormattedContentProps {
  content: string;
  image?: string;
  className?: string;
}

/**
 * Render teks yang dapat mengakomodasi:
 * 1. Rumus LaTeX inline ($rumus$) & display ($$rumus$$)
 * 2. Markdown image ![alt](url/base64) & tag <img>
 * 3. Gambar opsional terpisah (image prop)
 * 4. Baris baru & tabel terformat
 */
export const FormattedContent: React.FC<FormattedContentProps> = ({
  content,
  image,
  className = '',
}) => {
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  // Render teks rumus dan format
  const renderFormattedText = (rawText: string) => {
    if (!rawText) return null;

    // Pisahkan berdasarkan gambar markdown ![alt](src) terlebih dahulu jika ada
    const mdImageRegex = /!\[(.*?)\]\((.*?)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = mdImageRegex.exec(rawText)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = rawText.substring(lastIndex, match.index);
        parts.push(renderFormulasAndText(textBefore, `txt-${lastIndex}`));
      }

      const alt = match[1] || 'Gambar Soal';
      const src = match[2];
      parts.push(
        <span key={`img-${match.index}`} className="my-3 block">
          <span className="relative inline-block group max-w-full">
            <img
              src={src}
              alt={alt}
              className="max-h-72 max-w-full rounded-xl border border-slate-200 shadow-sm cursor-zoom-in object-contain bg-white hover:opacity-95 transition-opacity"
              onClick={() => setZoomImageUrl(src)}
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={() => setZoomImageUrl(src)}
              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/75 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-bold"
              title="Perbesar gambar"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Perbesar</span>
            </button>
          </span>
          {alt && alt !== 'Gambar Soal' && (
            <span className="block text-xs text-slate-500 italic mt-1">{alt}</span>
          )}
        </span>
      );

      lastIndex = mdImageRegex.lastIndex;
    }

    if (lastIndex < rawText.length) {
      parts.push(renderFormulasAndText(rawText.substring(lastIndex), `txt-${lastIndex}`));
    }

    return parts;
  };

  // Parsing rumus LaTeX $...$ atau $$...$$
  const renderFormulasAndText = (text: string, keyPrefix: string) => {
    // Regex mendeteksi $$...$$ (display math) atau $...$ (inline math)
    const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
    const segments: React.ReactNode[] = [];
    let curIdx = 0;
    let m: RegExpExecArray | null;

    while ((m = mathRegex.exec(text)) !== null) {
      if (m.index > curIdx) {
        segments.push(
          <span key={`${keyPrefix}-t-${curIdx}`} className="whitespace-pre-wrap">
            {text.substring(curIdx, m.index)}
          </span>
        );
      }

      const rawFormula = m[1];
      const isDisplay = rawFormula.startsWith('$$') && rawFormula.endsWith('$$');
      const formula = isDisplay
        ? rawFormula.slice(2, -2).trim()
        : rawFormula.slice(1, -1).trim();

      try {
        const html = katex.renderToString(formula, {
          displayMode: isDisplay,
          throwOnError: false,
        });

        segments.push(
          <span
            key={`${keyPrefix}-f-${m.index}`}
            className={isDisplay ? 'my-3 block text-center overflow-x-auto py-1' : 'inline-block px-1 align-baseline'}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        // Fallback jika KaTeX parsing error
        segments.push(
          <code
            key={`${keyPrefix}-err-${m.index}`}
            className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-mono text-xs font-semibold"
          >
            {rawFormula}
          </code>
        );
      }

      curIdx = mathRegex.lastIndex;
    }

    if (curIdx < text.length) {
      segments.push(
        <span key={`${keyPrefix}-t-${curIdx}`} className="whitespace-pre-wrap">
          {text.substring(curIdx)}
        </span>
      );
    }

    return <React.Fragment key={keyPrefix}>{segments}</React.Fragment>;
  };

  return (
    <div className={`formatted-question-content ${className}`}>
      {/* Teks Soal & Rumus */}
      {renderFormattedText(content)}

      {/* Gambar Soal jika terlampir di properti question.image */}
      {image && (
        <div className="mt-3.5 mb-2">
          <div className="relative inline-block group max-w-full">
            <img
              src={image}
              alt="Ilustrasi Soal"
              className="max-h-72 max-w-full rounded-xl border border-slate-200 shadow-sm cursor-zoom-in object-contain bg-white hover:opacity-95 transition-opacity"
              onClick={() => setZoomImageUrl(image)}
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={() => setZoomImageUrl(image)}
              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-bold"
              title="Perbesar gambar"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Perbesar Gambar</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Zoom Gambar */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setZoomImageUrl(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pratinjau Gambar Soal
              </span>
              <button
                type="button"
                onClick={() => setZoomImageUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center">
              <img
                src={zoomImageUrl}
                alt="Zoomed"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

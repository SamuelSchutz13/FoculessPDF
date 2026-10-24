import { dirname, join } from 'node:path';
import type { Canvas, SKRSContext2D } from '@napi-rs/canvas';

/** 150 DPI: sharp on screen and print-friendly, without huge files. */
const RENDER_SCALE = 150 / 72;
/** Caps the longest side so a poster-sized page can't allocate a giant canvas. */
const MAX_SIDE_PX = 5000;

const pdfjsRoot = dirname(require.resolve('pdfjs-dist/package.json'));

interface CanvasFactory {
  create(width: number, height: number): { canvas: Canvas; context: SKRSContext2D };
}

/**
 * Renders each page with pdf.js and hands the canvas to `onPage`, one page at a time,
 * so only one page bitmap is in memory.
 */
export async function renderPages(
  pdf: Buffer,
  onPage: (canvas: Canvas, pageNumber: number) => void,
): Promise<void> {
  // pdf.js is ESM-only; a dynamic import keeps it loadable from this CommonJS build.
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const task = getDocument({
    // pdf.js takes ownership of (and detaches) the buffer it gets, so pass a copy.
    data: new Uint8Array(pdf),
    // Without these, text in the 14 standard fonts and CJK text render with a fallback font.
    // pdf.js requires a trailing "/", which path.join turns into a backslash on Windows.
    standardFontDataUrl: `${join(pdfjsRoot, 'standard_fonts')}/`,
    cMapUrl: `${join(pdfjsRoot, 'cmaps')}/`,
    cMapPacked: true,
    verbosity: 0,
  });

  try {
    const doc = await task.promise;
    const canvasFactory = doc.canvasFactory as CanvasFactory;

    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const natural = page.getViewport({ scale: 1 });
      const scale = Math.min(RENDER_SCALE, MAX_SIDE_PX / Math.max(natural.width, natural.height));
      const viewport = page.getViewport({ scale });
      const { canvas, context } = canvasFactory.create(
        Math.ceil(viewport.width),
        Math.ceil(viewport.height),
      );

      await page.render({
        canvas: canvas as unknown as HTMLCanvasElement,
        canvasContext: context as unknown as CanvasRenderingContext2D,
        viewport,
      }).promise;
      onPage(canvas, pageNumber);
      page.cleanup();
    }
  } finally {
    await task.destroy();
  }
}

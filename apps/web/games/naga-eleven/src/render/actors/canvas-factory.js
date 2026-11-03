// the sheets are painted on canvases of their own; a page makes them in its document, and a test
// passes a canvas of its own making
export function documentCanvasFactory() {
  const page = globalThis.document;

  if (!page?.createElement) {
    return null;
  }

  return (width, height) => Object.assign(page.createElement('canvas'), { width, height });
}

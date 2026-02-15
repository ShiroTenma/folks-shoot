const createStripConfig = (overrides = {}) => ({
  maxPhotos: overrides.maxPhotos ?? 3,
  preview: {
    padTopPct: 0,
    padBottomPct: 0,
    padXPct: 0,
    gapPct: 0,
    moveXPct: 0,
    moveYPct: 0,
    ...(overrides.preview || {}),
  },
  canvas: {
    padTopPx: 0,
    padBottomPx: 0,
    padXPx: 0,
    moveXPx: 0,
    moveYPx: 0,
    ...(overrides.canvas || {}),
  },
});

const FRAME_LAYOUTS = {
  single: {
    maxPhotos: 1,
    preview: {
      padTopPct: 0,
      padBottomPct: 0,
      padXPct: 0,
      gapPct: 0,
      moveXPct: 0,
      moveYPct: 0,
    },
    canvas: {
      padTopPx: 0,
      padBottomPx: 0,
      padXPx: 0,
      moveXPx: 0,
      moveYPx: 0,
    },
  },
  strip: {
    default: createStripConfig(),
    byFrameId: {
      s1: createStripConfig({
        preview: { padTopPct: 0, padBottomPct: 6, padXPct: 0, gapPct: 0, moveXPct: 0, moveYPct: 0 },
        canvas: { padTopPx: 0, padBottomPx: 6, padXPx: 0, moveXPx: 0, moveYPx: 0 },
      }),
      s2: createStripConfig({
        preview: { padTopPct: 0, padBottomPct: 6, padXPct: 0, gapPct: 0, moveXPct: 0, moveYPct: 0 },
        canvas: { padTopPx: 0, padBottomPx: 6, padXPx: 0, moveXPx: 0, moveYPx: 0 },
      }),
      s3: createStripConfig({
        preview: { padTopPct: 20, padBottomPct: -12, padXPct: 0, gapPct: 0, moveXPct: 0, moveYPct: 0 },
        canvas: { padTopPx: 20, padBottomPx: -12, padXPx: 0, moveXPx: 0, moveYPx: 0 },
      }),
      s4: createStripConfig({
        preview: { padTopPct: 20, padBottomPct: -12, padXPct: 0, gapPct: 0, moveXPct: 0, moveYPct: 0 },
        canvas: { padTopPx: 20, padBottomPx: -12, padXPx: 0, moveXPx: 0, moveYPx: 0 },
      }),
      s5: createStripConfig({
        preview: { padTopPct: 14, padBottomPct: 1, padXPct: 0, gapPct: 0, moveXPct: 0, moveYPct: 0 },
        canvas: { padTopPx: 14, padBottomPx: 1, padXPx: 0, moveXPx: 0, moveYPx: 0 },
      }),
      s6: createStripConfig({
        preview: { padTopPct: 14, padBottomPct: 1, padXPct: 0, gapPct: 0, moveXPct: 0, moveYPct: 0 },
        canvas: { padTopPx: 14, padBottomPx: 1, padXPx: 0, moveXPx: 0, moveYPx: 0 },
      }),
      s7: createStripConfig({
        preview: { padTopPct: 10, padBottomPct: 2, padXPct: 0, gapPct: 0, moveXPct: 0, moveYPct: 0 },
        canvas: { padTopPx: 10, padBottomPx: 2, padXPx: 0, moveXPx: 0, moveYPx: 0 },
      }),
      s8: createStripConfig({
        maxPhotos: 2,
        preview: {
          padTopPct: 6,
          padBottomPct: 1,
          padXPct: 6,
          gapPct: 0,
          moveXPct: 0,
          moveYPct: 0,
        },
        canvas: {
          padTopPx: 70,
          padBottomPx: 190,
          padXPx: 60,
          moveXPx: 0,
          moveYPx: 0,
        },
      }),
      s9: createStripConfig({
        preview: { padTopPct: 10, padBottomPct: 2, padXPct: 0, gapPct: 0, moveXPct: 0, moveYPct: 0 },
        canvas: { padTopPx: 10, padBottomPx: 2, padXPx: 0, moveXPx: 0, moveYPx: 0 },
      }),
    },
  },
};

export const getFrameLayoutConfig = (layout, frameId) => {
  if (layout === 'single') return FRAME_LAYOUTS.single;

  return FRAME_LAYOUTS.strip.byFrameId[frameId] || FRAME_LAYOUTS.strip.default;
};

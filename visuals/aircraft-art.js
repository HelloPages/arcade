/* Original aircraft illustrations applied only to existing render canvases.
   Sprite canvas sizes, gameplay coordinates and collision data stay engine-owned. */
(() => {
  'use strict';
  const game = document.currentScript.dataset.game;
  const targets = game === 'stage2'
    ? [[sprPlayer, 'player', 0], [sprZeroDown, 'enemy', 0], [sprZeroUp, 'enemy', Math.PI], [sprZeroBL, 'enemy', Math.PI * .75], [sprZeroBR, 'enemy', Math.PI * .25]]
    : [[sprP38, 'player', 0], [sprP38L, 'player', -.08], [sprP38R, 'player', .08], [sprRedDown, 'enemy', 0], [sprRedBR, 'enemy', -Math.PI * .25], [sprRedBL, 'enemy', Math.PI * .25], [sprGrnDown, 'enemy', 0], [sprGrnBR, 'enemy', -Math.PI * .25], [sprGrnBL, 'enemy', Math.PI * .25], [sprAceDown, 'enemy', 0], [sprAceUp, 'enemy', Math.PI]];
  const images = {};
  const loads = ['player', 'enemy'].map(kind => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => { images[kind] = image; resolve(); };
    image.onerror = () => reject(new Error('Aircraft illustration failed to load'));
    image.src = `assets/redesign-${game}-${kind}.png`;
  }));
  Promise.all(loads).then(() => {
    for (const [canvas, kind, angle] of targets) {
      const context = canvas.getContext('2d');
      const image = images[kind];
      const scale = Math.min(canvas.width / image.width, canvas.height / image.height) * (angle ? .9 : 1);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(angle);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, -image.width * scale / 2, -image.height * scale / 2, image.width * scale, image.height * scale);
      context.restore();
    }
    document.body.dataset.aircraftArt = 'ready';
  }).catch(() => { document.body.dataset.aircraftArt = 'error'; });
})();

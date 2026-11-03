import { describe, expect, it } from 'vitest';
import { createPixelCanvas } from '../../support/pixel-canvas.js';
import { decodePng } from '../../support/png.js';

const pixelAt = (canvas, x, y) => [
  ...canvas.data.subarray((y * canvas.width + x) * 4, (y * canvas.width + x) * 4 + 4),
];

describe('the pixel canvas helpers look at drawings with', () => {
  it('fills rects and paths on whole pixels, under translate and alpha', () => {
    const canvas = createPixelCanvas(16, 16);
    const context = canvas.getContext('2d');

    context.fillStyle = '#ff0000';
    context.translate(2, 2);
    context.fillRect(0, 0, 4, 4);
    context.globalAlpha = 0.5;
    context.fillStyle = 'rgba(0, 0, 255, 1)';
    context.beginPath();
    context.moveTo(8, 8);
    context.lineTo(12, 8);
    context.lineTo(12, 12);
    context.lineTo(8, 12);
    context.fill();

    expect(pixelAt(canvas, 3, 3)).toEqual([255, 0, 0, 255]);
    expect(pixelAt(canvas, 1, 1)).toEqual([0, 0, 0, 0]);
    expect(pixelAt(canvas, 11, 11)[2]).toBeGreaterThan(120);
  });

  it('copies one canvas into another, mirrored by a negative scale', () => {
    const sprite = createPixelCanvas(2, 1);
    const target = createPixelCanvas(4, 1);
    const spriteContext = sprite.getContext('2d');
    const context = target.getContext('2d');

    spriteContext.fillStyle = '#00ff00';
    spriteContext.fillRect(0, 0, 1, 1);
    context.scale(-1, 1);
    context.drawImage(sprite, -2, 0);

    expect(pixelAt(target, 1, 0)).toEqual([0, 255, 0, 255]);
    expect(pixelAt(target, 0, 0)).toEqual([0, 0, 0, 0]);
  });

  it('writes a png that reads back to the same pixels', () => {
    const canvas = createPixelCanvas(3, 2);
    const context = canvas.getContext('2d');

    context.fillStyle = '#123456';
    context.fillRect(1, 0, 2, 2);

    const read = decodePng(canvas.toPng());

    expect([read.width, read.height]).toEqual([3, 2]);
    expect([...read.data]).toEqual([...canvas.data]);
  });
});

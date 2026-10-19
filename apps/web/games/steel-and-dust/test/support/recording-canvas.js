import { digest } from './digest.js';

const RECORDED_PROPERTIES = new Set([
  'fillStyle',
  'strokeStyle',
  'globalAlpha',
  'globalCompositeOperation',
  'imageSmoothingEnabled',
  'lineWidth',
]);

function describeArgument(value) {
  if (value && typeof value === 'object' && 'recordingId' in value) {
    return value.recordingId();
  }
  return String(value);
}

function createGradient(log, args) {
  const id = `gradient(${args.join(',')})`;
  return {
    recordingId: () => id,
    addColorStop: (...stop) => log.push(`${id}.stop(${stop.join(',')})`),
  };
}

export function createRecordingContext(canvas) {
  const log = [];
  const state = { fillStyle: '#000000', globalAlpha: 1 };
  const methods = {
    createRadialGradient: (...args) => {
      log.push(`createRadialGradient(${args.join(',')})`);
      return createGradient(log, args);
    },
    createLinearGradient: (...args) => {
      log.push(`createLinearGradient(${args.join(',')})`);
      return createGradient(log, args);
    },
  };
  const context = new Proxy(state, {
    get(target, name) {
      if (name === 'canvas') {
        return canvas;
      }
      if (name in methods) {
        return methods[name];
      }
      if (typeof name === 'symbol' || RECORDED_PROPERTIES.has(name)) {
        return target[name];
      }
      return (...args) => log.push(`${name}(${args.map(describeArgument).join(',')})`);
    },
    set(target, name, value) {
      target[name] = value;
      if (RECORDED_PROPERTIES.has(name)) {
        log.push(`${name}=${describeArgument(value)}`);
      }
      return true;
    },
  });
  return { context, log };
}

export class RecordingCanvas {
  constructor() {
    this.width = 300;
    this.height = 150;
    this.recording = null;
  }

  getContext() {
    this.recording ??= createRecordingContext(this);
    return this.recording.context;
  }

  recordingId() {
    const log = this.recording ? this.recording.log : [];
    return `canvas(${this.width}x${this.height},${digest(log)})`;
  }
}

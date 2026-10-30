import { Component, type ReactNode } from 'react';
import { playSwap, snapshotSwap, stopSwap } from './layout-swap.js';

type Snapshot = ReturnType<typeof snapshotSwap>;

interface LayoutSwapProps {
  // what the screen shows (loading, an error, its content): each change moves the blocks smoothly
  phase: string;
  // the blocks that change, rendered whether or not they show, so each is the same element after
  blocks: () => HTMLElement[];
  children: ReactNode;
}

// Only a class sees the page just before React changes it (getSnapshotBeforeUpdate), which a swap
// measures to move each block from where it stood (layout-swap.js).
export class LayoutSwap extends Component<LayoutSwapProps> {
  running: Animation[] = [];

  getSnapshotBeforeUpdate(previous: LayoutSwapProps): Snapshot {
    if (previous.phase === this.props.phase) {
      return null;
    }

    const snapshot = snapshotSwap(this.props.blocks());

    stopSwap(this.running);

    return snapshot;
  }

  componentDidUpdate(_previous: LayoutSwapProps, _state: unknown, snapshot: Snapshot) {
    if (snapshot) {
      this.running = playSwap(this.props.blocks(), snapshot);
    }
  }

  componentWillUnmount() {
    stopSwap(this.running);
  }

  render() {
    return this.props.children;
  }
}

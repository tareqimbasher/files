import { TabHistoryState } from "./tab-history-state";

/**
 * Keeps track of the navigation history for a Tab.
 */
export class TabHistory {
  public list: TabHistoryState[];
  public current!: TabHistoryState;
  public currentIndex = 0;
  public canGoBack = false;
  public canGoForward = false;

  constructor(current: string) {
    this.list = [];
    this.set(new TabHistoryState(current));
  }

  public set(state: TabHistoryState): TabHistoryState {
    this.current = state;

    const ix = this.list.indexOf(state);
    const isNew = ix < 0;

    if (isNew) {
      // If we had previouly gone "back" and we now have a new destination (not going forward in history)
      // then remove the rest of the forward history
      if (this.currentIndex != this.list.length - 1)
        this.list.splice(this.currentIndex + 1, this.list.length - this.currentIndex);

      this.list.push(state);
      this.currentIndex = this.list.length - 1;
    } else this.currentIndex = ix;

    this.canGoBack = this.currentIndex > 0;
    this.canGoForward = this.currentIndex < this.list.length - 1;

    return state;
  }

  public getPrevious(): TabHistoryState | undefined {
    return this.currentIndex >= 1 ? this.list[this.currentIndex - 1] : undefined;
  }

  public getNext(): TabHistoryState | undefined {
    return this.currentIndex < this.list.length - 1 ? this.list[this.currentIndex + 1] : undefined;
  }
}

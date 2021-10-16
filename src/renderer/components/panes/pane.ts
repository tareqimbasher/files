import { IContainer, IDisposable } from 'aurelia';
import { Util } from '../../core';
import { Panes } from './panes';
import { Tabs } from './tabs/tabs';

export class Pane implements IDisposable {
    public id: string;
    public isActive = false;
    public tabs: Tabs;

    constructor(public panes: Panes, private container: IContainer) {
        this.id = Util.newGuid();
        this.tabs = new Tabs(this, container);
    }

    public activate() {
        this.panes.setActive(this);
    }

    public close() {
        this.panes.remove(this);
    }

    public dispose(): void {
        this.tabs.dispose();
    }
}
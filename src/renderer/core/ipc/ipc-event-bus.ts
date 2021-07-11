import { Constructable, IDisposable, IEventAggregator, singleton } from "aurelia";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { DrivesChangedEvent } from "../events/drives-changed";

@singleton()
export class IpcEventBus implements IDisposable {
    private disposables: (() => void)[] = [];

    constructor(@IEventAggregator private readonly eventBus: IEventAggregator) {
        let token = this.subscribe(DrivesChangedEvent, message => this.eventBus.publish(new DrivesChangedEvent()));
        this.disposables.push(() => token.dispose());
    }

    private publish<T extends Constructable>(message: T extends Constructable ? InstanceType<T> : T) {
        if (message.constructor) {
            ipcRenderer.send(message.constructor.name, message);
        }
    }

    private subscribe<T extends Constructable>(type: T, callback: (message: InstanceType<T>) => void) {
        if (type.name) {
            const handler = (event: IpcRendererEvent, args: any[]) => callback(args[0]);
            ipcRenderer.on(type.name, handler);
            return new Token(() => ipcRenderer.off(type.name, handler));
        }
        else {
            throw new Error(`Type has no name`);
        }
    }

    public dispose() {
        this.disposables.forEach(d => d());
    }
}

export class Token {
    constructor(private func: () => void) {
    }

    public dispose() {
        this.func();
    }
}
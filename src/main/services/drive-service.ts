import * as usb from 'usb';
import { DrivesChangedEvent } from '../../renderer/core/events/drives-changed';
import { IpcEventBus } from '../ipc/ipc-event-bus';

export class DriveService {
    private disposables: (() => void)[] = [];

    constructor(private readonly ipcEventBus: IpcEventBus) {
    }

    public start() {
        const attached = (device: usb.Device) => this.deviceAttached(device);
        const detached = (device: usb.Device) => this.deviceDetached(device);

        usb.on('attach', attached);
        usb.on('detach', detached);
        this.disposables.push(() => usb.removeListener('attach', attached));
        this.disposables.push(() => usb.removeListener('detach', detached));
    }

    public stop() {
        for (const disposable of this.disposables) {
            disposable();
        }
    }

    private deviceAttached(device: usb.Device) {
        this.ipcEventBus.publish(new DrivesChangedEvent())
    }

    private deviceDetached(device: usb.Device) {
        this.ipcEventBus.publish(new DrivesChangedEvent())
    }
}
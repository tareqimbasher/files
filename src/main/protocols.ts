import { App, protocol } from 'electron';
import * as path from "path";
import { promises as fs } from 'fs';


export function registerProtocols(app: App) {
    // Custom protocol to load files from disk
    protocol.registerFileProtocol('atom', async (request, callback) => {

        const filePath = decodeURI(request.url.substr(7));

        if (path.isAbsolute(filePath) ? await pathExists(filePath) : await pathExists(`/${filePath}`)) {
            callback(filePath);
        } else {
            callback(path.join(app.getAppPath(), filePath));
        }
    });
}

const pathExists = async (p: string) => {
    try {
        await fs.access(p);
        return true;
    } catch (error) {
        return false;
    }
}
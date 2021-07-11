import { exec } from "child_process";
import { Drive } from "./drive";
import { system } from "./system";

export class DriveService {
    private static readonly WINDOWS_COMMAND: string = 'wmic logicaldisk get Name,Caption,FileSystem,Size,FreeSpace,VolumeName /format:list';
    private static readonly LINUX_COMMAND: string = 'df -P | awk \'NR > 1\'';
    private static readonly DARWIN_COMMAND: string = 'df -P | awk \'NR > 1\'';

    public async list(): Promise<Drive[]> {
        if (system.platform === "win32") {
            return await this.windows();
        }
        else
            throw new Error(`Platform ${system.platform} not implemented.`); // TODO implement
    }

    private windows() {
        return new Promise<Drive[]>((resolve, reject) => {

            const drives: Drive[] = []

            exec(DriveService.WINDOWS_COMMAND,
                { shell: "powershell.exe" },
                (error, stdout, stderr) => {

                    if (error) {
                        reject(stderr);
                        return;
                    }

                    if (!stdout) {
                        resolve(drives);
                        return;
                    }

                    const driveInfos: any[] = [];

                    let lastLineEmpty = true;
                    stdout
                        .trim()
                        .split(system.os.EOL)
                        .map(l => l?.trim())
                        .forEach(line => {
                            if (!line) {
                                lastLineEmpty = true;
                                return;
                            }
                            else if (lastLineEmpty) {
                                driveInfos.push({});
                                lastLineEmpty = false;
                            }

                            const kv = line.split('=');
                            const obj = driveInfos[driveInfos.length - 1];
                            obj[kv[0]] = kv[1];
                        });

                    for (var i = 0; i < driveInfos.length; i++) {
                        const driveInfo = driveInfos[i];
                        const path: string = driveInfo["Name"] || driveInfo["Caption"];
                        const volume: string = driveInfo["VolumeName"];

                        let name = volume || 'Local Disk';
                        name = `${name} (${path})`.trim();

                        const size = Number(driveInfo["Size"]);
                        const free = Number(driveInfo["FreeSpace"]);
                        const used = size - free;

                        drives.push(new Drive(
                            name,
                            path,
                            driveInfo["FileSystem"],
                            size,
                            used,
                            free
                        ));
                    }

                    resolve(drives);
                });
        });
    }
}

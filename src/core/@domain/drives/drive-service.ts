import { Drive } from "./drive";
import { system } from "common";

export class DriveService {
  private static readonly WINDOWS_COMMAND: string =
    "wmic logicaldisk get Name,Caption,FileSystem,Size,FreeSpace,VolumeName /format:list";
  private static readonly UNIX_COMMAND: string = "df -PT | awk 'NR > 1' | grep '^/'";

  public async list(): Promise<Drive[]> {
    return system.platform === "win32" ? await this.windows() : await this.unix();
  }

  private unix(): Promise<Drive[]> {
    return new Promise<Drive[]>((resolve, reject) => {
      const drives: Drive[] = [];

      system.exec(DriveService.UNIX_COMMAND, (error, stdout, stderr) => {
        if (error) {
          reject(stderr);
          return;
        }

        if (!stdout) {
          resolve(drives);
          return;
        }

        const tmp = stdout
          .trim()
          .split(system.os.EOL)
          .map((x) =>
            x
              .trim()
              .split(" ")
              .filter((x) => !!x)
          )
          .map(
            (x) =>
              new Drive(
                x[x.length - 1],
                x[x.length - 1],
                x[1],
                Number(x[2]) * 1000,
                Number(x[3]) * 1000,
                Number(x[4]) * 1000
              )
          );

        drives.push(...tmp);
        resolve(drives);
      });
    });
  }

  private windows(): Promise<Drive[]> {
    return new Promise<Drive[]>((resolve, reject) => {
      const drives: Drive[] = [];

      system.exec(
        DriveService.WINDOWS_COMMAND,
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
            .map((l) => l?.trim())
            .forEach((line) => {
              if (!line) {
                lastLineEmpty = true;
                return;
              } else if (lastLineEmpty) {
                driveInfos.push({});
                lastLineEmpty = false;
              }

              const kv = line.split("=");
              const obj = driveInfos[driveInfos.length - 1];
              obj[kv[0]] = kv[1];
            });

          for (let i = 0; i < driveInfos.length; i++) {
            const driveInfo = driveInfos[i];
            const path: string = driveInfo["Name"] || driveInfo["Caption"];
            const volume: string = driveInfo["VolumeName"];

            let name = volume || "Local Disk";
            name = `${name} (${path})`.trim();

            const size = Number(driveInfo["Size"]);
            const free = Number(driveInfo["FreeSpace"]);
            const used = size - free;

            drives.push(new Drive(name, path, driveInfo["FileSystem"], size, used, free));
          }

          resolve(drives);
        }
      );
    });
  }
}

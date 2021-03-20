import { singleton } from "aurelia";

@singleton()
export class Settings {
    public theme: string;
    public inverted: string;

    constructor() {
        this.theme = "light";
        this.inverted = "";
    }

    public setTheme(theme: string) {
        this.theme = theme;
        this.inverted = theme == "dark" ? "inverted" : "";
    }

    public toggleTheme() {
        this.setTheme(this.theme === "dark" ? "light" : "dark");
    }
}
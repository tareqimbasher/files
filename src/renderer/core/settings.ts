import { singleton } from "aurelia";

@singleton()
export class Settings {
    public theme: string;
    public inverted: string;

    constructor() {
        this.theme = "";
        this.inverted = "";

        this.setTheme("dark");
    }

    public setTheme(theme: string) {
        this.theme = theme;
        this.inverted = theme == "dark" ? "inverted" : "";
    }

    public toggleTheme() {
        this.setTheme(this.theme === "dark" ? "light" : "dark");
    }
}
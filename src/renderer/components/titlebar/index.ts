import { Color, Titlebar } from "custom-electron-titlebar";

window.addEventListener('DOMContentLoaded', () => {
    let titleBar = new Titlebar({
        backgroundColor: Color.fromHex('#2f3241'),
        unfocusEffect: true
    });

    const replaceText = (selector: string, text: string) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, (<any>process).versions[type])
    }
});
const customTitlebar = require('custom-electron-titlebar');

window.addEventListener('DOMContentLoaded', () => {
    let titleBar = new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#2f3241')
    });


    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }

    titleBar.updateTitle("Files New");
})
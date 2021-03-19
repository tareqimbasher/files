export class Window {
    public attached() {
        this.setupSidebarResizing();
        this.setupPaneResizing();
    }

    private setupSidebarResizing() {
        let sidebar = document.getElementsByTagName('sidebar')[0] as HTMLElement;
        let paneGroup = document.getElementsByTagName('pane-group')[0] as HTMLElement;
        this.setupResizing(sidebar, paneGroup);
    }

    private setupPaneResizing() {
        let panes = document.getElementsByTagName('pane');
        if (panes.length != 2)
            return;

        let leftPane = panes[0] as HTMLElement;
        let rightPane = panes[1] as HTMLElement;

        this.setupResizing(leftPane, rightPane);
        return;
    }

    private setupResizing(leftElement: HTMLElement, rightElement: HTMLElement) {

        let mousePosition: number;

        let resize = (ev: MouseEvent) => {
            if (ev.which == 0) {
                document.removeEventListener("mousemove", resize);
                return;
            }

            const dx = mousePosition - ev.x;
            mousePosition = ev.x;

            let rightElementWidth = parseInt(getComputedStyle(rightElement, '').width);
                (parseInt(getComputedStyle(rightElement, ':before')?.width) || 0) +
                (parseInt(getComputedStyle(rightElement, ':after')?.width) || 0);

            let leftElementWidth = parseInt(getComputedStyle(leftElement, '').width);
                (parseInt(getComputedStyle(leftElement, ':before')?.width) || 0) +
                (parseInt(getComputedStyle(leftElement, ':after')?.width) || 0);

            rightElementWidth += dx;
            leftElementWidth -= dx;

            rightElement.style.flex = "0 " + rightElementWidth + "px";
            leftElement.style.flex = "0 0 " + leftElementWidth + "px";
        };

        rightElement.addEventListener("mousedown", ev => {
            if (ev.target == rightElement && ev.offsetX < 10) {
                mousePosition = ev.x;
                document.addEventListener("mousemove", resize);
            }
        });

        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", resize);
        });
    }
}


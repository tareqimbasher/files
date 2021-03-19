export class Window {
    public attached() {
        this.setupSidebarResizing();
        this.setupPaneResizing();
    }

    private setupSidebarResizing() {
        // Resizing of sidebar and pane group
        let sidebar = document.getElementsByTagName('sidebar')[0] as HTMLElement;
        let paneGroup = document.getElementsByTagName('pane-group')[0] as HTMLElement;

        let mousePosition: number;

        let resize = (ev: MouseEvent) => {
            const dx = mousePosition - ev.x;
            mousePosition = ev.x;
            let paneGroupWidth = parseInt(getComputedStyle(paneGroup, '').width) + dx;
            paneGroup.style.flex = "0 " + paneGroupWidth + "px";
            sidebar.style.flex = "0 0 " + (window.innerWidth - paneGroupWidth) + "px";
        }

        paneGroup.addEventListener("mousedown", ev => {
            if (ev.target == paneGroup && ev.offsetX < 4) {
                mousePosition = ev.x;
                document.addEventListener("mousemove", resize);
            }
        });

        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", resize);
        });
    }

    private setupPaneResizing() {
        let panes = document.getElementsByTagName('pane');
        if (panes.length != 2)
            return;


        let leftPane = panes[0] as HTMLElement;
        let rightPane = panes[1] as HTMLElement;
        let paneGroup = document.getElementsByTagName('pane-group')[0] as HTMLElement;

        let mousePosition: number;

        let resize = (ev: MouseEvent) => {
            if (ev.which == 0) {
                document.removeEventListener("mousemove", resize);
                return;
            }

            const dx = mousePosition - ev.x;
            mousePosition = ev.x;
            let rightPaneWidth = parseInt(getComputedStyle(rightPane, '').width) + dx;
            rightPane.style.flex = "0 " + rightPaneWidth + "px";
            leftPane.style.flex = "0 " + (
                paneGroup.offsetWidth - parseInt(getComputedStyle(paneGroup, ':before').width) - rightPaneWidth
            ) + "px";
        }

        rightPane.addEventListener("mousedown", ev => {
            if (ev.target == rightPane && ev.offsetX < 10) {
                mousePosition = ev.x;
                document.addEventListener("mousemove", resize);
            }
        });

        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", resize);
        });
    }
}


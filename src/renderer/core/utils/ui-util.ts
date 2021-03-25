export class UiUtil {
    public static navigateGrid(
        grid: Element, 
        activeItemClass: string, 
        direction: "up" | "down" | "right" | "left", 
        select: (nextItemIndex: number) => void) {
            
            // Get all grid children (items to select from)
            const gridChildren = Array.from(grid.children) as HTMLElement[];
            const gridChildrenCount = gridChildren.length;

            // If grid contains no children, do nothing
            if (gridChildrenCount == 0)
                return;

            // Get the currently selected item(s)
            const selected = grid.querySelectorAll(`.${activeItemClass}`);

            // If no item(s) currently selected, select the first child in the grid
            if (selected.length == 0) {
                select(0);
                return;
            }

            // The first selected item is the item we will assume is the *the* selected item
            const active = selected[0] as HTMLElement;
            const activeIndex = gridChildren.indexOf(active);

            // Calculate how many items in a row
            const baseOffset = gridChildren[0].offsetTop;
            const breakIndex = gridChildren.findIndex(item => item.offsetTop > baseOffset);
            const numPerRow = (breakIndex === -1 ? gridChildrenCount : breakIndex);

            const isTopRow = activeIndex <= numPerRow - 1;
            const isBottomRow = activeIndex >= gridChildrenCount - numPerRow;
            const isLeftColumn = activeIndex % numPerRow === 0;
            const isRightColumn = activeIndex % numPerRow === numPerRow - 1 || activeIndex === gridChildrenCount - 1;

            // Select the next item
            switch (direction) {
                case "up":
                    if (!isTopRow)
                        select(activeIndex - numPerRow);
                    break;
                case "down":
                    if (!isBottomRow)
                        select(activeIndex + numPerRow);
                    break;
                case "left":
                    if (!isLeftColumn)
                        select(activeIndex - 1);
                    break;
                case "right":
                    if (!isRightColumn)
                        select(activeIndex + 1);
                    break;
            }
    }
}
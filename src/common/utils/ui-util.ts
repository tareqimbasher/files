export class UiUtil {
  public static navigateGrid(
    grid: Element,
    activeItemSelector: string,
    direction: "up" | "down" | "right" | "left",
    select: (nextItemIndex: number, nextItemElement: HTMLElement) => void
  ): void {
    // Get all grid children (items to select from)
    const gridChildren = Array.from(grid.children) as HTMLElement[];
    const gridChildrenCount = gridChildren.length;

    // If grid contains no children, do nothing
    if (gridChildrenCount == 0) return;

    // Get the currently selected item(s)
    const selectedItems = grid.querySelectorAll(activeItemSelector);

    // If no item(s) currently selected, select the first child in the grid
    if (selectedItems.length == 0) {
      select(0, gridChildren[0]);
      return;
    }

    // The first selected item is the item we will assume is the *the* selected item
    const selectedItem = (
      direction == "up" || direction == "left"
        ? selectedItems[0]
        : selectedItems[selectedItems.length - 1]
    ) as HTMLElement;
    const selectedItemIndex = gridChildren.indexOf(selectedItem);

    // Calculate how many items in a row
    const baseOffset = gridChildren[0].offsetTop;
    const breakIndex = gridChildren.findIndex((item) => item.offsetTop > baseOffset);
    const numPerRow = breakIndex === -1 ? gridChildrenCount : breakIndex;
    const rowsCount = Math.ceil(gridChildrenCount / numPerRow);

    const selectedItemPosition = this.getItemPosition(
      selectedItemIndex,
      gridChildrenCount,
      rowsCount,
      numPerRow
    );

    // Calculate the next item
    let nextItemIndex = -1;
    if (direction === "up") {
      if (rowsCount === 1) {
        nextItemIndex = selectedItemIndex;
      } else if (selectedItemPosition.isTopRow) {
        const itemsInLastRow = gridChildrenCount % numPerRow;
        const doesLastRowHaveColumn =
          itemsInLastRow === 0 || itemsInLastRow >= selectedItemPosition.columnIndex + 1;

        nextItemIndex = doesLastRowHaveColumn
          ? numPerRow * (rowsCount - 1) + selectedItemPosition.columnIndex // Select item on last row on same column
          : selectedItemIndex; // Select currently selected element
      } else {
        nextItemIndex = selectedItemIndex - numPerRow;
      }
    } else if (direction === "down") {
      if (rowsCount === 1) {
        nextItemIndex = selectedItemIndex;
      } else if (selectedItemPosition.isBottomRow) {
        nextItemIndex = selectedItemPosition.columnIndex; // Select item on the first row on same column
      } else {
        const doesNextRowHaveColumn =
          (selectedItemPosition.rowIndex + 1) * numPerRow + selectedItemPosition.columnIndex + 1 <=
          gridChildrenCount;
        nextItemIndex = doesNextRowHaveColumn
          ? selectedItemIndex + numPerRow // Select item on next row on same column
          : gridChildrenCount - 1; // Select last item
      }
    } else if (direction === "right") {
      nextItemIndex = !selectedItemPosition.isRightColumn
        ? selectedItemIndex + 1
        : selectedItemPosition.isBottomRow
        ? 0
        : numPerRow * (selectedItemPosition.rowIndex + 1);
    } else if (direction === "left") {
      nextItemIndex = !selectedItemPosition.isLeftColumn
        ? selectedItemIndex - 1
        : selectedItemPosition.isTopRow
        ? gridChildrenCount - 1
        : numPerRow * selectedItemPosition.rowIndex - 1;
    }

    if (nextItemIndex < 0) return;

    // const nextItemPosition = this.getItemPosition(
    //   nextItemIndex,
    //   gridChildrenCount,
    //   rowsCount,
    //   numPerRow
    // );
    // console.warn(nextItemPosition, nextItemIndex, gridChildren[nextItemIndex]);

    select(nextItemIndex, gridChildren[nextItemIndex]);
  }

  public static selfOrClosestParentWithClass(
    element: HTMLElement | null,
    className: string
  ): HTMLElement | null {
    if (element === null) return null;
    if (element.classList.contains(className)) return element;
    return UiUtil.selfOrClosestParentWithClass(element.parentElement, className);
  }

  public static hasOrParentHasClass(element: HTMLElement | null, className: string): boolean {
    if (element === null) return false;
    if (element.classList.contains(className)) return true;
    return !!element.parentNode && UiUtil.hasOrParentHasClass(element.parentElement, className);
  }

  private static getItemPosition(
    itemIndex: number,
    allItemsCount: number,
    rowsCount: number,
    itemsPerRow: number
  ): ItemPosition {
    return new ItemPosition(
      itemIndex % itemsPerRow,
      Math.floor(itemIndex / itemsPerRow),
      itemIndex % itemsPerRow === itemsPerRow - 1 || itemIndex === allItemsCount - 1,
      itemIndex % itemsPerRow === 0,
      itemIndex <= itemsPerRow - 1,
      itemIndex >= (rowsCount - 1) * itemsPerRow
    );
  }
}

class ItemPosition {
  constructor(
    public columnIndex: number,
    public rowIndex: number,
    public isRightColumn: boolean,
    public isLeftColumn: boolean,
    public isTopRow: boolean,
    public isBottomRow: boolean
  ) {}
}

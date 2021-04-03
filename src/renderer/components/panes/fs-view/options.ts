export class Options {
    public view: View;
    public sortBy: SortBy;

    constructor() {
        this.view = View.Icons;
        this.sortBy = SortBy.Name;
    }
}

export enum View {
    Icons = "Icons",
    List = "List",
}

export enum SortBy {
    Name = "Name",
    DateModified = "DateModified",
    Type = "Type",
    Size = "Size",
}
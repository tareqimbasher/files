export class FsViewSorting {
    public by: string;
    public dir: string;
    public type: string;

    constructor() {
        this.by = 'name';
        this.dir = 'asc';
        this.type = 'ordinalIgnoreCase';
    }

    public sortBy(propertyName: string) {
        this.by = propertyName;

        switch (propertyName) {
            case 'name':
            case 'typeDescription':
                this.type = 'ordinalIgnoreCase';
                break;
            case 'size':
                this.type = 'numeral';
                break;
            case 'dateModified':
                this.type = 'date';
                break;
        }
    }

    public sortDir(direction: 'asc' | 'desc') {
        this.dir = direction;
    }

    public sort(propertyName: string, direction: 'asc' | 'desc') {

        const byChanged = this.by !== propertyName;

        this.sortBy(propertyName);

        if (direction)
            this.sortDir(direction);
        else if (!byChanged) {
            this.sortDir(this.dir === 'asc' ? 'desc' : 'asc');
        }
    }
}
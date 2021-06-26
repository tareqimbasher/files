import moment from 'moment';

export class SortValueConverter {
    toView(array: any[], propertyName: string, direction = 'desc', comparison = 'ordinalIgnoreCase') {
        if (array == null) return;

        if (!comparison)
            comparison = 'ordinalIgnoreCase';

        console.warn(comparison);

        let self: any = this;
        var directionFactor = direction === 'asc' ? 1 : -1,
            comparer = self[comparison + 'Comparison'];

        if (!comparer)
            return array;
        if (propertyName === undefined)
            return array.sort((a, b) => comparer(a, b) * directionFactor);
        return array.sort((a, b) => comparer(a[propertyName], b[propertyName]) * directionFactor);
    }


    numeralComparison(a: any, b: any) {
        if ((a === null || a === undefined || isNaN(a)) && (b === null || b === undefined || isNaN(b)))
            return 0;
        if (a === null || a === undefined || isNaN(a))
            return -1;
        if (b === null || b === undefined || isNaN(b))
            return 1;
        a = Number(a);
        b = Number(b);
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    }

    ordinalIgnoreCaseComparison(a: any, b: any) {
        if ((a === null || a === undefined) && (b === null || b === undefined))
            return 0;
        if (a === null || a === undefined)
            return -1;
        if (b === null || b === undefined)
            return 1;
        a = a.toString().toLowerCase();
        b = b.toString().toLowerCase();
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    }

    ordinalComparison(a: any, b: any) {
        if ((a === null || a === undefined) && (b === null || b === undefined))
            return 0;
        if (a === null || a === undefined)
            return -1;
        if (b === null || b === undefined)
            return 1;
        a = a.toString();
        b = b.toString();
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    }

    dateComparison(a: any, b: any) {
        a = new Date(a);
        b = new Date(b);
        if ((a === null || a === undefined) && (b === null || b === undefined))
            return 0;
        if (a === null || a === undefined)
            return -1;
        if (b === null || b === undefined)
            return 1;
        return moment(a).diff(moment(b));
    }

    numberComparison(a: any, b: any) {
        if ((a === null || a === undefined) && (b === null || b === undefined))
            return 0;
        if (a === null || a === undefined)
            return -1;
        if (b === null || b === undefined)
            return 1;
        return a - b;
    }
} 
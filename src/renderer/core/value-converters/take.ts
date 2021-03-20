export class TakeValueConverter {
    public toView(array: any[], take: number) {

        if (!array || !take)
            return [];

        if (take > array.length)
            take = array.length;

        return array.slice(0, take);
    }
}
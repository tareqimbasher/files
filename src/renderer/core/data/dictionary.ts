export class Dictionary<TKey extends string | number | Date, TValue> {
    private data: any = {};
    private keyMap: any = {};

    /**
     * Number of items in this dictionary.
     */
    public length = 0;

    /**
    * Values stored in this dictionary.
    */
    public values: TValue[] = [];

    /**
     * Adds a key/value pair to this dictionary if key doesn't exist, otherwise sets provided value to the existing key.
     */
    public addOrSet(key: TKey, value: TValue): void {
        this.addOrSetRange({
            key: key,
            value: value
        });
    }

    /**
     * Adds or sets a range of key/value pairs to this dictionary. If keys doesn't exist they will be added, otherwise provided values will be set to their existing key.
     */
    public addOrSetRange(...items: { key: TKey, value: TValue }[]) {
        const values = [];

        if (items.findIndex(i => i.key === undefined || i.key === null) >= 0)
            throw new Error("Cannot add a null or undefined key.");

        for (var i = 0; i < items.length; i++) {
            const item = items[i];
            const key = item.key;
            const value = item.value;

            const stringKey = this.getStringKey(key);
            if (!this.keyMap.hasOwnProperty(stringKey))
                this.keyMap[stringKey] = key;

            this.data[stringKey] = value;
            values.push(value);
        }

        this.values.push(...values);
        this.length = this.values.length;
    }

    /**
     * Removes an item from the dictionary.
     */
    public remove(key: TKey): TValue | undefined {
        if (this.containsKey(key)) {
            const stringKey = this.getStringKey(key);
            const valueToRemove = this.data[stringKey];
            delete this.data[stringKey];
            delete this.keyMap[stringKey];
            this.values.splice(this.values.indexOf(valueToRemove), 1);
            this.length = this.values.length;
            return valueToRemove;
        }
        return undefined;
    }

    /**
     * Gets value by key.
     */
    public get(key: TKey): TValue {
        const stringKey = this.getStringKey(key);
        if (!this.data.hasOwnProperty(stringKey))
            throw new Error(`Key '${key}' not found.`);
        return this.data[stringKey];
    }

    /**
     * Checks if the provided key exists in the dictionary.
     */
    public containsKey(key: TKey) {
        return this.keyMap.hasOwnProperty(this.getStringKey(key));
    }

    /**
     * Returns all keys in this dictionary.
     */
    public keys(): TKey[] {
        return Object.values(this.keyMap);
    }

    /**
     * Iterates over the key/value pairs of this dictionary.
     */
    public forEach(iterator: (iterator: { key: TKey, value: TValue }) => void) {
        for (let [k, v] of Object.entries(this.data)) {
            iterator({
                key: this.keyMap[k],
                value: v as TValue
            });
        }
    }

    /**
     * Removes all entries from this dictionary.
     */
    public clear() {
        this.data = {};
        this.values.splice(0, this.values.length);
        this.length = 0;
    }

    private getStringKey(key: TKey) {
        return key.toString();
    }
}

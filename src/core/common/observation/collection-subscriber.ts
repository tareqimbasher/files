import { ICollectionSubscriber, IndexMap } from "@aurelia/runtime";
import { LifecycleFlags } from "aurelia";

export class CollectionSubscriber implements ICollectionSubscriber {
  constructor(public onChange: (indexMap: IndexMap) => void) {}

  public handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void {
    this.onChange(indexMap);
  }
}

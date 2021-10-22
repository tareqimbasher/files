import { ISubscriber } from "@aurelia/runtime";
import { LifecycleFlags } from "aurelia";

export class PropertySubscriber<TValue = unknown> implements ISubscriber<TValue> {
  constructor(public onChange: (newValue: unknown, previousValue: unknown) => void) {}

  public handleChange(newValue: TValue, previousValue: TValue, flags: LifecycleFlags): void {
    this.onChange(newValue, previousValue);
  }
}

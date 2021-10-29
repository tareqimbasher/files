import { Settings } from "application";
import { IEventAggregator } from "aurelia";

export class ShortcutActionExecutionContext {
  constructor(
    public readonly event: KeyboardEvent,
    public readonly settings: Settings,
    @IEventAggregator public readonly eventBus: IEventAggregator
  ) {}
}

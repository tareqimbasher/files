import { DialogDefaultConfiguration } from "@aurelia/runtime-html";
import { Aurelia, ColorOptions, ConsoleSink, LoggerConfiguration, LogLevel } from "aurelia";
import "./style/semantic-ui/dist/semantic.css";
import "./jquery.load";
import "./style/semantic-ui/dist/semantic.js";
import "./style/main.scss";
import { converters } from "./global-resources";
import { Window } from "./components/window";

Aurelia.register(
  LoggerConfiguration.create({
    colorOptions: ColorOptions.colors,
    level: LogLevel.info,
    sinks: [ConsoleSink],
  }),
  DialogDefaultConfiguration.customize((config) => {
    config.lock = true;
  }),
  converters
)
  .app(Window)
  .start();

import { Aurelia, ColorOptions, ConsoleSink, LoggerConfiguration, LogLevel } from 'aurelia';
import { Window } from './components/window';
import { converters } from './global-resources';
import "./jquery.load";
import "./style/semantic-ui/dist/semantic.css";
import "./style/semantic-ui/dist/semantic.js";

Aurelia
    .register(
        LoggerConfiguration.create({
            colorOptions: ColorOptions.colors,
            level: LogLevel.info,
            sinks: [ConsoleSink]
        }),
        converters
    )
    .app(Window)
    .start();

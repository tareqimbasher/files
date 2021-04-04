import { Aurelia, ColorOptions, ConsoleSink, LoggerConfiguration, LogLevel } from 'aurelia';
import "./jquery.load";
import "./style/semantic-ui/dist/semantic.css";
import "./style/semantic-ui/dist/semantic.js";
import { converters } from './global-resources';
import "./components/titlebar";
import { Window } from './components/window';

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

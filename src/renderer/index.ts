import { Aurelia } from 'aurelia';
import { resources } from './global-resources';
import "./jquery.load";
import "./style/semantic-ui/dist/semantic.css";
import "./style/semantic-ui/dist/semantic.js";
import { Window } from './components/window/window';

Aurelia
    .register(resources)
    .app(Window)
    .start();

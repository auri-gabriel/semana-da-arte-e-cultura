import { render } from 'preact';
import './styles/main.scss';
import { App } from './app.tsx';

render(<App />, document.getElementById('app')!);

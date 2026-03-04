import { render } from 'preact';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/main.scss';
import { App } from './app.tsx';

document.documentElement.setAttribute('data-bs-theme', 'light');

render(<App />, document.getElementById('app')!);

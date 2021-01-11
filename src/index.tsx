import * as React from "react";
import * as ReactDOM from "react-dom";

// own component imports
import App from "./components/App";
// style imports
import './assets/style/globalStyle.scss';

const root = document.getElementById('app');
ReactDOM.render(<App />, root);
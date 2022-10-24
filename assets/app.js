

import ReactDom from "react-dom/client";
import App from "./js/App";
import React from "react";
import './css/app.css'

(() => {
    const container = document.querySelector('#root');

    const root = ReactDom.createRoot(container);

    root.render(<App />);
})()
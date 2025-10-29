import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // Comment <React.StrictMode> to better analyze component lifecycle without double rendering
    // enable it to find common bugs in react components (impure rendering, missing effect cleanup, missing ref cleanup)
    // see https://react.dev/reference/react/StrictMode for more information
    // <React.StrictMode>
        <App />
    // </React.StrictMode>
);


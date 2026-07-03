import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// This is the mount point: it grabs the <div id="root"> from index.html and
// tells React to render the App component tree into it. Everything the
// browser shows starts here.
//
// StrictMode is a development-only wrapper that intentionally double-invokes
// certain functions to help surface side-effect bugs early. It has no
// effect on the production build.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

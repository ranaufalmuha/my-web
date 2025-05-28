import React from "react";
import ReactDOM from "react-dom/client";
import "./style/index.css";
import { HashRouter, RouterProvider } from "react-router-dom";
import AppRoute from "./routes";

// Create a root wrapper component
const Root = () => {
  return <RouterProvider router={AppRoute} />;
};

// Render the app
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <HashRouter>
//       <AppRoute />
//     </HashRouter>
//   </React.StrictMode>
// );

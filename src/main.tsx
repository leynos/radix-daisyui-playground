/** @file Bootstraps the Radix × DaisyUI playground SPA for Bun's HTML entry point. */

import React from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import RadixDaisyUIPlayground from "./index";

const mount = document.getElementById("root");

if (!mount) {
  throw new Error("Mount point '#root' is required to render the SPA.");
}

createRoot(mount).render(
  <React.StrictMode>
    <RadixDaisyUIPlayground />
  </React.StrictMode>,
);

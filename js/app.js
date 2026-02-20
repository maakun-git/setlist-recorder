import { Controller } from "./controller.js";
import { initView } from "./view.js";

window.addEventListener("DOMContentLoaded", () => {
  const controller = new Controller();
  initView(controller);
});

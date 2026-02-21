import { Controller } from "./controller.js";
import { initView } from "./view.js";
import { initHelp } from "./help.js";

window.addEventListener("DOMContentLoaded", () => {
  const controller = new Controller();
  initView(controller);
  initHelp();
});

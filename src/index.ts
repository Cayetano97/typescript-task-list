import { App } from "./App.js";
window.addEventListener("load", async (): Promise<void> => {
  const app: App = new App();
  app.init();
});

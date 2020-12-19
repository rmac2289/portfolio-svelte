import App from "./App.svelte";

const app = new App({
  target: document.body,
  intro: true,
  hydratable: true,
});

export default app;

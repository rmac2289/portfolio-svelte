import App from "./App.svelte";

const app = new App({
  target: document.body,
  intro: true,
  hydrate: true,
});

export default app;

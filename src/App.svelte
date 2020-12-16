<script>
	import router from "page";
	import Home from "./Home.svelte";
	import About from "./About.svelte";
	import Experience from "./Experience.svelte";
	import Contact from "./Contact.svelte";
	import Projects from "./Projects.svelte";
	let page;
	router("/", () => (page = Home));
	router("/about", () => (page = About));
	router("/experience", () => (page = Experience));
	router("/contact", () => (page = Contact));
	router("/projects", () => (page = Projects));
	router.start();
	import Layout from "./Layout.svelte";
</script>

<style>
</style>

<Layout>
	<svelte:component this={page} />
</Layout>

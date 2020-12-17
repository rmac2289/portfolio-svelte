<script>
	import router from "page";
	import Home from "./components/Home.svelte";
	import About from "./components/About.svelte";
	import Experience from "./components/Experience.svelte";
	import Contact from "./components/Contact.svelte";
	import Projects from "./components/Projects.svelte";
	import Resume from "./components/Resume.svelte";
	import Nav from "./components/Nav.svelte";
	let page;
	router("/", () => (page = Home));
	router("/about", () => (page = About));
	router("/experience", () => (page = Experience));
	router("/contact", () => (page = Contact));
	router("/projects", () => (page = Projects));
	router("/resume", () => (page = Resume));
	router.start();
</script>

<style>
	div {
		display: flex;
		justify-content: space-between;
	}
</style>

<div>
	<svelte:component this={page} />
	<Nav />
</div>

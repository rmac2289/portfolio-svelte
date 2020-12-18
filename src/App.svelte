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
	.page-box {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>

<div>
	<div class="page-box">
		<svelte:component this={page} />
	</div>
	<Nav />
</div>

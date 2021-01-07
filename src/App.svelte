<script>
	import Home from "./components/Home.svelte";
	import Experience from "./components/Experience.svelte";
	import Contact from "./components/Contact.svelte";
	import Projects from "./components/Projects.svelte";
	import Resume from "./components/Resume.svelte";
	import Nav from "./components/utils/Nav.svelte";
	import { Router, Route } from "svelte-routing";
	export let url = "";
</script>

<style>
	div {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>

<Router {url}>
	<div>
		<Nav />
		<Route path="/">
			<Home />
		</Route>
		<Route path="/experience">
			<Experience />
		</Route>
		<Route path="/projects">
			<Projects />
		</Route>
		<Route path="/resume">
			<Resume />
		</Route>
		<Route path="/contact">
			<Contact />
		</Route>
	</div>
</Router>

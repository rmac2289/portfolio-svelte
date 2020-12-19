<script>
	import Home from "./components/Home.svelte";
	import About from "./components/About.svelte";
	import Experience from "./components/Experience.svelte";
	import Contact from "./components/Contact.svelte";
	import Projects from "./components/Projects.svelte";
	import Resume from "./components/Resume.svelte";
	import Nav from "./components/Nav.svelte";
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
		height: 100vh;
	}
</style>

<div>
	<div class="page-box">
		<Home />
		<Nav />
	</div>
</div>

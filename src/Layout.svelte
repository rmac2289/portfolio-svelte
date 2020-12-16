<script>
    import Nav from "./Nav.svelte";
</script>

<style>
    main {
        display: flex;
        flex-direction: column;
        margin: 0;
    }
</style>

<main>
    <Nav />
    <slot />
</main>

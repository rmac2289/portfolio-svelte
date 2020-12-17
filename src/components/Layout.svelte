<script>
    import Nav from "./Nav.svelte";
</script>

<style>
    main {
        display: flex;
        flex-direction: column;
        margin: 0;
    }
    div {
        display: flex;
        justify-content: space-between;
    }
</style>

<main>
    <div>
        <slot />
        <Nav />
    </div>
</main>

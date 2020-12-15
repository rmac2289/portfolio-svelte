<script>
    import Nav from "./Nav.svelte";
    let src = "images/mountainbottom.png";
</script>

<style>
    main {
        display: flex;
        flex-direction: column;
        margin: 0;
    }
    img {
        width: 100vh;
        position: absolute;
        bottom: 0;
        width: 100vw;
    }
</style>

<main>
    <Nav />
    <slot />
    <img {src} alt="background" />
</main>

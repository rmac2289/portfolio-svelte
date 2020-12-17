<script>
    import { open } from "../store.js";
    import { fade } from "svelte/transition";
</script>

<style>
    div {
        width: 100%;
    }
    h2 {
        font-size: 1.25em;
        font-weight: 100;
        color: white;
        height: 50px;
        padding: 22px;
        border-top: 1px solid white;
        margin-top: 0;
        text-align: center;
    }
    h1 {
        margin-bottom: 0;
        margin-top: 10px;
        height: 50px;
        padding: 22px;
        border-bottom: 1px solid white;
        font-size: 2.5em;
        font-weight: 100;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>

<div>
    <h1 out:fade>Ross MacDonald</h1>
    <h2 out:fade>Full Stack Web Developer</h2>
</div>

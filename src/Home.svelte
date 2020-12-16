<script>
    import { open } from "./store.js";
    import { fade } from "svelte/transition";
</script>

<style>
    h2 {
        white-space: nowrap;
        overflow: hidden;
        animation: keyframes 5s steps(500, end);
        width: 100%;
        font-size: 1.5em;
        font-weight: 100;
    }

    @keyframes keyframes {
        from {
            opacity: 0.5;
            width: 0px;
        }
    }
    div {
        white-space: nowrap;
        overflow: hidden;
        width: 90%;
        padding: 1rem;
        color: white;
    }
    h1 {
        font-size: 3em;
        font-weight: 100;
        transition: 0.25s 0.5s all linear;
    }
    @media only screen and (min-width: 520px) {
        .open {
            margin-top: 100px;
            transition: 0.25s all linear;
        }
    }
</style>

<div>
    <h1 class:open={$open} out:fade>Ross <br /> MacDonald</h1>
    <h2 out:fade>Full Stack <br /> Web Developer</h2>
</div>

<script>
    import { drag } from "../drag.js";
    import { fade } from "svelte/transition";
    let isVisible = true;
    function handleDragStop(e) {
        if (e.detail.x > 300) {
            isVisible = false;
        }
    }
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
    .box {
        background: white;
        height: 100px;
        width: 100px;
    }
</style>

<div>
    <h1 out:fade>Ross MacDonald</h1>
    <h2 out:fade>Full Stack Web Developer</h2>
    <!-- {#if isVisible}
        <div
            transition:fade
            use:drag
            on:dragStop={handleDragStop}
            class="box" />
    {/if} -->
</div>

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
    .container {
        width: 600px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 1rem;
        align-items: flex-start;
        border-left: 1px solid rgb(255, 255, 255, 0.5);
    }
    h2 {
        font-size: 2em;
        color: white;
        font-weight: 100;
    }

    .sub-header {
        display: flex;
        align-items: center;
        height: 50px;
        padding: 22px;
        margin: 0;
        padding-top: 10px;
        padding-left: 1px;
    }
    h1 {
        margin-bottom: 0;
        height: 50px;
        margin-top: 10px;
        padding: 22px;
        padding-left: 0;
        padding-right: 0;
        font-size: 4em;
        font-weight: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        border-bottom: 1px solid rgb(255, 255, 255, 0.5);
    }
    .box {
        background: white;
        height: 100px;
        width: 100px;
    }
</style>

<div class="container">
    <h1 out:fade>Ross MacDonald</h1>
    <div class="sub-header">
        <h2 out:fade>Full Stack Web Developer</h2>
    </div>
    <!-- {#if isVisible}
        <div
            transition:fade
            use:drag
            on:dragStop={handleDragStop}
            class="box" />
    {/if} -->
</div>

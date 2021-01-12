<script>
    import { fade, fly } from "svelte/transition";
    import { store, darkmode } from "../store";
    import Switch from "./utils/Switch.svelte";
</script>

<style>
    .container {
        max-width: 600px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 1rem;
        align-items: flex-start;
        border-left: 1px solid rgb(255, 255, 255, 0.5);
    }
    h2 {
        font-size: 1.5em;
        color: white;
        font-weight: 100;
        overflow: hidden;
        white-space: nowrap;
        margin: 0 auto;
    }
    .sub-header {
        height: 50px;
        padding: 22px;
        margin: 0;
        padding-left: 1px;
    }
    h1 {
        margin-bottom: 0;
        min-height: 50px;
        margin: 0;
        padding: 20px 0 0 0;
        font-size: 3em;
        font-weight: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        border-bottom: 1px solid rgb(255, 255, 255, 0.5);
    }
    .page-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        transition: 0.75s all linear;
    }
    .dark {
        transition: 0.75s all linear;
        background-color: rgb(0, 0, 0, 0.6);
    }
    .dark::before {
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        transition: 0.75s all linear;
        background-size: cover;
        background-repeat: no-repeat;
        background-attachment: fixed;
        background-position: top;
        background-image: url("/images/stars.jpg");
        z-index: -1;
        opacity: 0.5;
    }
    .switch-box {
        position: fixed;
        bottom: 20px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    @media only screen and (min-width: 520px) {
        .sub-header {
            padding-top: 10px;
        }
        h1 {
            font-size: 4em;
        }
        h2 {
            font-size: 2em;
        }
    }
</style>

<svelte:head>
    <title>Ross MacDonald</title>
</svelte:head>
<div
    in:fly={{ duration: 1000, y: 300, delay: 400 }}
    class={$darkmode ? 'page-box dark' : 'page-box'}>
    <div class="container">
        <h1>Ross MacDonald</h1>
        <div class="sub-header">
            <h2>
                {#each $store.subtitle as letter, i}
                    <span
                        in:fade={{ delay: i * 100, duration: 1000 }}>{letter}</span>
                {/each}
            </h2>
        </div>
    </div>
    <div class="switch-box">
        <Switch bind:checked={$darkmode} />
    </div>
</div>

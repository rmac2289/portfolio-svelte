<script>
    import { fade, fly } from "svelte/transition";
    import { readableStore, darkmode } from "../store";
    const setDarkMode = () => {
        darkmode.update((darkmode) => !darkmode);
    };
    import Switch from "./Switch.svelte";
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
        font-size: 2em;
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
    button {
        position: absolute;
        bottom: 0;
        left: 0;
        transition: 0.75s all linear;
    }
    h1 {
        margin-bottom: 0;
        min-height: 50px;
        margin: 0;
        padding: 20px 0 0 0;
        font-size: 4em;
        font-weight: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        border-bottom: 1px solid rgb(255, 255, 255, 0.5);
    }
    .page-box {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        transition: 0.75s all linear;
    }
    .dark {
        background: rgb(0, 0, 0, 0.8);
        transition: 0.75s all linear;
    }
    @media only screen and (min-width: 520px) {
        .sub-header {
            padding-top: 10px;
        }
    }
</style>

<svelte:head>
    <title>Ross MacDonald</title>
</svelte:head>
<div
    in:fly={{ duration: 1000, y: -100 }}
    class={$darkmode ? 'page-box dark' : 'page-box'}>
    <div class="container">
        <h1>Ross MacDonald</h1>
        <div class="sub-header">
            <h2>
                {#each $readableStore.subtitle as letter, i}
                    <span
                        in:fade={{ delay: i * 100, duration: 1000 }}>{letter}</span>
                {/each}
            </h2>
        </div>
    </div>
    <Switch bind:checked={$darkmode} />
</div>

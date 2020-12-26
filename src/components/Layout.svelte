<script>
    import CornerLogo from "./CornerLogo.svelte";
    import { fade, slide } from "svelte/transition";
    import { darkmode } from "../store";
    const setDarkMode = () => {
        darkmode.update((darkmode) => !darkmode);
    };
    import Switch from "./Switch.svelte";
</script>

<style>
    .container {
        width: 90%;
        height: 100%;
        margin-top: 100px;
        margin-bottom: 100px;
        margin-left: auto;
        margin-right: auto;
        padding: 1rem;
    }
    .dark {
        background: rgb(0, 0, 0, 0.8);
        transition: 0.75s all linear;
    }
    .page {
        width: 100%;
        height: 100%;
        padding: 1rem;
        transition: 0.75s all linear;
    }

    @media only screen and (min-width: 720px) {
        .container {
            width: 70%;
        }
        .page {
            min-width: 400px;
        }
    }
</style>

<div class={$darkmode ? 'page dark' : 'page'}>
    <div
        in:slide={{ duration: 1000, delay: 600 }}
        out:fade={{ duration: 1 }}
        class="container">
        <CornerLogo />
        <slot />
    </div>
    <Switch bind:checked={$darkmode} />
</div>

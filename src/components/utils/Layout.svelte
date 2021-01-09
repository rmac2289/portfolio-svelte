<script>
    import CornerLogo from "./CornerLogo.svelte";
    import { fade, fly } from "svelte/transition";
    import Switch from "./Switch.svelte";
    import { darkmode } from "../../store";
</script>

<style>
    .container {
        width: 95%;
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
    @media only screen and (min-width: 520px) {
        .container {
            width: 85%;
        }
    }
    @media only screen and (min-width: 720px) {
        .container {
            width: 80%;
            min-width: 400px;
        }
    }
    @media only screen and (min-width: 1024) {
        .container {
            width: 75%;
        }
    }
</style>

<div class={$darkmode ? 'page dark' : 'page'}>
    <div class="container">
        <CornerLogo />
        <div
            in:fly={{ duration: 1500, y: 500, delay: 600 }}
            out:fade={{ duration: 1 }}>
            <slot />
        </div>
    </div>
</div>

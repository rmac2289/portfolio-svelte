<script>
    import CornerLogo from "./CornerLogo.svelte";
    import { fade, fly } from "svelte/transition";
    import Switch from "./Switch.svelte";
    import { darkmode } from "../../store";
</script>

<style>
    .container {
        height: 100%;
        width: 100%;
        margin-bottom: 100px;
        margin-left: auto;
        margin-right: auto;

        transition: 0.75s all linear;
    }
    .dark {
        background-color: rgb(0, 0, 0, 0.6);
        position: relative;
        transition: 0.75s all linear;
        z-index: 9997;
    }
    .dark::before {
        content: "";
        position: absolute;
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
    .slot-container {
        padding-top: 150px;
    }
    .page {
        height: 100%;
        width: 100%;
        transition: 0.75s all linear;
    }
    .switch-box {
        display: flex;
        justify-content: center;
        align-items: center;
        padding-bottom: 20px;
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
            class="slot-container"
            in:fly={{ duration: 1500, y: 500, delay: 600 }}
            out:fade={{ duration: 1 }}>
            <slot />
        </div>
    </div>
    <div class="switch-box">
        <Switch bind:checked={$darkmode} />
    </div>
</div>

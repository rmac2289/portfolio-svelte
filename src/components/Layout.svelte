<script>
    import CornerLogo from "./CornerLogo.svelte";
    import { slide } from "svelte/transition";
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
    .page {
        width: 100%;
        height: 100%;
        padding: 1rem;
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

<div in:slide={{ duration: 1000, delay: 600 }} class="page">
    <div class="container">
        <CornerLogo />
        <slot />
    </div>
</div>

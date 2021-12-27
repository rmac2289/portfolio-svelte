<script>
    let y;
    import { fly } from "svelte/transition";
</script>

<style>
    .container {
        display: none;
        position: fixed;
        opacity: 0.75;
        top: 10px;
        right: 20px;
        max-width: 600px;
        flex-direction: column;
        justify-content: center;
        padding: 10px;
        align-items: center;
    }
    hr {
        color: white;
        background: white;
        height: 0.25px;
        width: 100%;
        margin: 0;
        padding: 0;
        border: none;
    }

    .corner-sub {
        font-size: 0.75em;
        color: white;
        font-weight: 100;
        margin-top: 7px;
        font-family: "Lustria", serif;
    }

    .sub-header {
        margin: 0;
        display: flex;
        padding-left: 1px;
    }
    .corner-name {
        margin-bottom: 2px;
        font-size: 1.5em;
        font-weight: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: "Lustria", serif;
    }

    @media only screen and (min-width: 720px) {
        .container {
            display: flex;
        }
    }
</style>

<svelte:window bind:scrollY={y} />
{#if y < 200}
    <div
        in:fly={{ delay: 500, y: -100, duration: 1000 }}
        out:fly={{ duration: 1000, y: -100 }}
        class="container">
        <h1 class="corner-name">Ross MacDonald</h1>
        <hr />
        <div class="sub-header">
            <h2 class="corner-sub">Full Stack Engineer</h2>
        </div>
    </div>
{/if}

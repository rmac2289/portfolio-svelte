<script>
    import Carousel from "../utils/Carousel.svelte";
    import { readableStore } from "../../store";
    let fypMobileImages = $readableStore.fypMobile.images;
    let techUsed = $readableStore.fypMobile.tech;
    import { fly } from "svelte/transition";
    let postgres = "images/elephant.png";
</script>

<style>
    .container {
        background: rgb(0, 0, 0, 0.5);
        padding: 1rem;
        min-width: 400px;
        box-shadow: var(--main-shadow);
    }
    h2 {
        color: rgba(255, 255, 255, 0.95);
        text-align: center;
        font-family: "Lato", sans-serif;
        font-weight: 900;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.25);
    }
    p {
        color: rgba(255, 255, 255, 0.95);
        font-size: 1.25em;
    }
    i {
        font-size: 28px;
        color: rgba(255, 255, 255, 0.95);
    }
    header {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.25);
        box-shadow: var(--main-shadow);
        padding: 0.5rem;
    }
    .thumbnail {
        padding: 0.5rem;
        box-shadow: var(--main-shadow);
        padding: 0;
    }
    .icon-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        text-align: center;
        gap: 20px;
        padding: 1rem;
    }
    .header-left {
        width: 85%;
        margin-left: auto;
        margin-right: auto;
        margin: 0;
        margin-right: 0.5rem;

        background: rgb(0, 0, 0, 0.5);
        box-shadow: var(--main-shadow);
    }
    .img {
        height: 30px;
        width: 30px;
        text-align: center;
    }
</style>

<div in:fly={{ duration: 1000, y: 600 }} class="container">
    <header>
        <div class="header-left">
            <h2>Find Your Park Mobile</h2>
            <div class="icon-grid">
                {#each $readableStore.tech as tech}
                    {#if techUsed.includes(tech.name)}
                        <i class={tech.class} style="color:{tech.color}" />
                    {/if}
                {/each}
                <div><img class="img" src={postgres} alt="postgres" /></div>
            </div>
        </div>
        <img class="thumbnail" width="125" src={fypMobileImages[0]} alt="fyp" />
    </header>
    <div>
        <p>
            The Find Your Park iOS mobile app. Built with React Native, the app
            uses similar logic to the original app but refactored to native
            standards. Mobile version contains all functionality of the web app,
            with slightly different formatting. Available now on the Apple App
            Store.
        </p>
    </div>
    <!-- <Carousel height="400" width="185" images={fypMobileImages} /> -->
</div>

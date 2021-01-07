<script>
    import Carousel from "../utils/Carousel.svelte";
    import { readableStore } from "../../store";
    import { readable } from "svelte/store";
    let fypImages = $readableStore.fyp.images;
    let postgres = "images/elephant.png";
    let techUsed = $readableStore.fyp.tech;
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
    .thumbail {
        padding: 0.5rem;
        box-shadow: var(--main-shadow);
        padding: 0;
    }
    .icon-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        text-align: center;
        gap: 20px;
        padding: 1rem;
    }
    .header-left {
        background: rgb(0, 0, 0, 0.5);
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

<div class="container">
    <header>
        <div class="header-left">
            <h2>Find Your Park</h2>
            <div class="icon-grid">
                {#each $readableStore.tech as tech}
                    {#if techUsed.includes(tech.name)}
                        <i class={tech.class} style="color:{tech.color}" />
                    {/if}
                {/each}
                <div><img class="img" src={postgres} alt="postgres" /></div>
            </div>
        </div>
        <img class="thumbnail" height="220" src={fypImages[0]} alt="fyp" />
    </header>
    <div>
        <p>
            A full-stack application for Californians looking to head outdoors.
            The app allows a user to find parks in their area via several
            different search methods. I built this because of what I saw as a
            shortage of aggregated data on parks run by different agencies
            (state, national, county, etc.). Through further data aggregation,
            the app will soon be available for other states.
        </p>
    </div>
    <!-- <Carousel height="200" width="198" images={fypImages} />  -->
</div>

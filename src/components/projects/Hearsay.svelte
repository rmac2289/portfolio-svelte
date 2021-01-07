<script>
    import Carousel from "../utils/Carousel.svelte";
    import { readableStore } from "../../store";
    let hearsayImages = $readableStore.hearsay.images;
    import { fly } from "svelte/transition";
    let postgres = "images/elephant.png";
    let techUsed = $readableStore.hearsay.tech;
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
    .img {
        height: 30px;
        width: 30px;
        text-align: center;
    }
    .thumbnail {
        padding: 0;
        box-shadow: var(--main-shadow);
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
        margin-left: 0.25rem;
    }
    @media only screen and (min-width: 720px) {
        .container {
            grid-column: 1/3;
        }
    }
</style>

<div in:fly={{ duration: 1000, y: 600 }} class="container">
    <header>
        <div class="header-left">
            <h2>Hearsay</h2>
            <div class="icon-grid">
                {#each $readableStore.tech as tech}
                    {#if techUsed.includes(tech.name)}
                        <i class={tech.class} style="color:{tech.color}" />
                    {/if}
                {/each}
                <div><img class="img" src={postgres} alt="postgres" /></div>
            </div>
        </div>
        <img
            class="thumbnail"
            height="260"
            width="350"
            src={hearsayImages[0]}
            alt="fyp" />
    </header>
    <div>
        <p>
            Hearsay is a full-stack application built with social justice in
            mind. Users can log encounters with law enforcement and speak on
            discussion boards about criminal justice issues. This app was built
            with current events in mind - with so much turmoil and change, I
            feel we need more venues for people to make their voices heard.
        </p>
    </div>
    <!-- <Carousel height="400" width="537" images={hearsayImages} /> -->
</div>

<script>
    import Carousel from "../utils/Carousel.svelte";
    import { store, darkmode } from "../../store";
    import { fade } from "svelte/transition";
    let safetyImages = $store.safetyBlanket.images;
    let techUsed = $store.safetyBlanket.tech;
    import ProjectTechGrid from "../utils/ProjectTechGrid.svelte";
    let carouselOpen = false;
    function openCarousel() {
        carouselOpen = !carouselOpen;
    }
    function clickOutsideClose(e) {
        console.dir(e.target);
        if (carouselOpen && e.target.className.includes("carousel-container")) {
            carouselOpen = !carouselOpen;
        }
        return;
    }
</script>

<style>
    .container {
        background: rgb(0, 0, 0, 0.5);
        padding: 1rem;
        min-width: 400px;
        box-shadow: var(--main-shadow);
        transition: 0.75s all linear;
    }
    .carousel-container {
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9998;
    }
    .carousel-container::before {
        content: "";
        position: absolute;
        background-image: linear-gradient(
            rgb(0, 0, 0, 0.75),
            rgb(0, 0, 0, 0.75)
        );
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        filter: blur(100px);
        z-index: -1;
        height: 100%;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
    }
    .container-dark {
        background: rgb(0, 0, 0, 0.5);
        padding: 1rem;
        min-width: 400px;
        transition: 0.75s all linear;
        box-shadow: var(--dark-shadow);
    }
    h2 {
        color: rgba(255, 255, 255, 0.95);
        text-align: center;
        font-weight: 900;
        margin: 0;
        font-family: "Lato", sans-serif;
    }
    .title {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        margin: 0;
        height: 50px;
        background: rgb(0, 0, 0, 0.35);
        display: flex;
        justify-content: flex-start;
        padding-left: 1.5rem;
        align-items: center;
        box-shadow: var(--main-shadow);
    }
    .thumbnail {
        padding: 0;
        box-shadow: var(--main-shadow);
        z-index: 9997;
    }
    header {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.25);
        box-shadow: var(--main-shadow);
        padding: 0.5rem;
        position: relative;
    }
    .header-left {
        width: 85%;
        margin-left: auto;
        margin-right: auto;
        margin: 0;
        margin-right: 0.5rem;
    }
    p {
        color: rgba(255, 255, 255, 0.95);
        font-size: 1.25em;
    }
</style>

<div class={$darkmode ? 'container-dark' : 'container'}>
    <header>
        <div class="title">
            <h2>Safety Blanket</h2>
        </div>
        <div class="header-left">
            <ProjectTechGrid {techUsed} />
        </div>
        <img
            on:click={openCarousel}
            class="thumbnail"
            width="150"
            src={safetyImages[0]}
            alt="fyp" />
    </header>
    <div>
        <p>
            Safety Blanket is a full stack mobile app that provides users with
            emergency and non-emergency public safety help at their fingertips.
            A user's geolocation is used to find agencies closest to them. The
            landing screen give the user the option to call an agency, open up
            the location in google maps, or to save the contact information in
            their phone.
        </p>
    </div>
    {#if carouselOpen}
        <div
            transition:fade
            on:click={clickOutsideClose}
            class="carousel-container">
            <Carousel height="533" width="300" images={safetyImages} />
            <button on:click={() => (carouselOpen = false)}>X</button>
        </div>
    {/if}
</div>

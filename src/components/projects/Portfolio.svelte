<script>
    import Carousel from "../utils/Carousel.svelte";
    import { store, darkmode } from "../../store";
    import { fade } from "svelte/transition";
    let portfolioImages = $store.portfolio.images;
    let techUsed = $store.portfolio.tech;
    import ProjectTechGrid from "../utils/ProjectTechGrid.svelte";
    let carouselOpen = false;
    function openCarousel() {
        carouselOpen = !carouselOpen;
    }
    function clickOutsideClose(e) {
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
        box-shadow: var(--main-shadow);
        transition: 0.75s all linear;
    }
    .image-icon {
        width: 25%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        cursor: pointer;
    }
    i {
        color: rgba(255, 255, 255, 0.95);
        font-size: 28px;
    }
    .container-dark {
        background: rgb(0, 0, 0, 0.5);
        padding: 1rem;
        transition: 0.75s all linear;
        box-shadow: var(--dark-shadow);
    }
    h2 {
        color: rgba(255, 255, 255, 0.95);
        font-weight: 900;
        margin: 0;
        text-align: left;
        width: 75%;
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
        padding-left: 1.5rem;
        padding-right: 1.5rem;
        align-items: center;
        box-shadow: var(--main-shadow);
    }
    .thumbnail {
        display: none;
        width: 300px;
        padding: 0;
        margin: 25px;
        box-shadow: var(--main-shadow);
        z-index: 9997;
        cursor: pointer;
    }
    header {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        background: rgba(255, 255, 255, 0.25);
        box-shadow: var(--main-shadow);
        padding: 0.5rem;
        position: relative;
    }
    .header-left {
        width: 95%;
        margin-left: auto;
        margin-right: auto;
    }
    p {
        color: rgba(255, 255, 255, 0.95);
        font-size: 1.25em;
    }
    @media only screen and (min-width: 720px) {
        header {
            flex-direction: row;
            justify-content: initial;
        }
        .container,
        .container-dark {
            min-width: 400px;
        }
    }
    @media only screen and (min-width: 900px) {
        .thumbnail {
            width: 300px;
            display: initial;
            margin: initial;
        }
        .header-left {
            width: 85%;
        }
        i {
            display: none;
        }
    }
</style>

<div class={$darkmode ? 'container-dark' : 'container'}>
    <header>
        <div class="title">
            <h2>This site!</h2>
            <div on:click={openCarousel} class="image-icon">
                <i class="fas fa-photo-video" />
            </div>
        </div>
        <div class="header-left">
            <ProjectTechGrid {techUsed} />
        </div>
        <img
            on:click={openCarousel}
            class="thumbnail"
            src="images/portfoliohome.png"
            alt="portfolio" />
    </header>
    <div>
        <p>
            My personal portfolio site, built with Svelte. I felt that a React
            or Vue was a bit too heavy for what I needed for such a lightweight
            site. Svelte was super easy to use and was the perfect choice.
        </p>
    </div>
    {#if carouselOpen}
        <div
            transition:fade
            on:click={clickOutsideClose}
            class="carousel-container">
            <Carousel width="600" images={portfolioImages} />
        </div>
    {/if}
</div>

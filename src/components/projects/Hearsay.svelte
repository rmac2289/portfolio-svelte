<script>
    import Carousel from "../utils/Carousel.svelte";
    import { store, darkmode } from "../../store";
    import { fade } from "svelte/transition";
    let hearsayImages = $store.hearsay.images;
    let techUsed = $store.hearsay.tech;
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
        text-align: center;
        font-weight: 900;
        margin: 0;
        width: 75%;
        text-align: left;
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
            display: initial;
            width: 250px;
            margin: initial;
        }
        .header-left {
            width: 85%;
        }
        i {
            display: none;
        }
    }
    @media only screen and (min-width: 1024px) {
        .thumbnail {
            width: 350px;
        }
    }
</style>

<div class={$darkmode ? 'container-dark' : 'container'}>
    <header>
        <div class="title">
            <h2>Hearsay</h2>
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
            src="images/hearsay/hearsay.png"
            alt="hearsay" />
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
    {#if carouselOpen}
        <div
            transition:fade
            on:click={clickOutsideClose}
            class="carousel-container">
            <Carousel projectClass="hearsay" images={hearsayImages} />
        </div>
    {/if}
</div>

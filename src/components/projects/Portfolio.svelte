<script>
    import Carousel from "../utils/Carousel.svelte";
    import { store } from "../../store";
    let portfolioImages = $store.portfolio.images;
    import { fly } from "svelte/transition";
    let techUsed = $store.portfolio.tech;
    let svelte = "images/svelte.png";
    import ProjectTechGrid from "../utils/ProjectTechGrid.svelte";
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
        width: 225px;
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
    @media only screen and (min-width: 720px) {
        .thumbnail {
            width: 300px;
        }
    }
</style>

<div class="container">
    <header>
        <div class="title">
            <h2>This site!</h2>
        </div>
        <div class="header-left">
            <ProjectTechGrid {techUsed} />
        </div>
        <img class="thumbnail" src={portfolioImages[0]} alt="meal" />
    </header>
    <div>
        <p>
            My personal portfolio site, built with Svelte. I felt that a React
            or Vue was a bit too heavy for what I needed for such a lightweight
            site. Svelte was super easy to use and was the perfect choice.
        </p>
    </div>
    <!-- <Carousel height="400" width="331" images={mealImages} /> -->
</div>

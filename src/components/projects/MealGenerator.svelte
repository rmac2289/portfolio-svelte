<script>
    import Carousel from "../utils/Carousel.svelte";
    import { store } from "../../store";
    let mealImages = $store.mealGenerator.images;
    import { fly } from "svelte/transition";
    let techUsed = $store.mealGenerator.tech;
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

<div class="container">
    <header>
        <div class="title">
            <h2>Meal Generator</h2>
        </div>
        <div class="header-left">
            <ProjectTechGrid {techUsed} />
        </div>
        <img
            class="thumbnail"
            height="200"
            width="165"
            src={mealImages[0]}
            alt="meal" />
    </header>
    <div>
        <p>
            The meal generator is a single-page app that allows the user to
            create a meal plan for the week. I built this out of necessity -
            working full time while learning to code has been tough at times;
            the meal generator maps out every meal and provides links to
            recipes, automating a time-consuming task for your week.
        </p>
    </div>
    <!-- <Carousel height="400" width="331" images={mealImages} /> -->
</div>

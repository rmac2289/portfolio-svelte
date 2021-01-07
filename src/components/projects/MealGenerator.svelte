<script>
    import Carousel from "../utils/Carousel.svelte";
    import { readableStore } from "../../store";
    let mealImages = $readableStore.mealGenerator.images;
    import { fly } from "svelte/transition";
    let techUsed = $readableStore.mealGenerator.tech;
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
</style>

<div in:fly={{ duration: 1000, y: 600 }} class="container">
    <header>
        <div class="header-left">
            <h2>Meal Generator</h2>
            <div class="icon-grid">
                {#each $readableStore.tech as tech}
                    {#if techUsed.includes(tech.name)}
                        <i class={tech.class} style="color:{tech.color}" />
                    {/if}
                {/each}
            </div>
        </div>
        <img height="200" width="165" src={mealImages[0]} alt="meal" />
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

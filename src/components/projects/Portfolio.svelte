<script>
    import Carousel from "../utils/Carousel.svelte";
    import { readableStore } from "../../store";
    let portfolioImages = $readableStore.portfolio.images;
    import { fly } from "svelte/transition";
    let techUsed = $readableStore.portfolio.tech;
    let svelte = "images/svelte.png";
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
    .img-icon-box {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .img {
        height: 30px;
        width: 30px;
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
            <h2>This site!</h2>
            <div class="icon-grid">
                {#each $readableStore.tech as tech}
                    {#if techUsed.includes(tech.name)}
                        <i class={tech.class} style="color:{tech.color}" />
                    {/if}
                {/each}
                <div class="img-icon-box">
                    <img class="img" src={svelte} alt="svelte" />
                </div>
            </div>
        </div>
        <img width="400" src={portfolioImages[0]} alt="meal" />
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

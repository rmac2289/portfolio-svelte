<script>
    import Carousel from "../utils/Carousel.svelte";
    import { readableStore } from "../../store";
    let mealImages = $readableStore.mealGenerator.images;
</script>

<style>
    .container {
        max-width: 400px;
    }
</style>

<div class="container">
    <div><img width="400" src={mealImages[0]} alt="img" /></div>
    {#if false}
        <Carousel height="300" width="225" images={mealImages} />
    {/if}
</div>

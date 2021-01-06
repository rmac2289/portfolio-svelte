<script>
    import Carousel from "./Carousel.svelte";
    import { readableStore } from "../store";
    let safetyImages = $readableStore.safetyImages;
    let hearsayImages = $readableStore.hearsayImages;
    let mealImages = $readableStore.mealImages;
    let fypImages = $readableStore.fypImages;
    let fypMobileImages = $readableStore.fypMobileImages;
</script>

<style>
</style>

<div class="grid">
    <Carousel height="600" width="350" images={safetyImages} />
    <Carousel height="600" width="300" images={fypMobileImages} />
    <Carousel height="500" width="600" images={hearsayImages} />
    <Carousel height="600" width="450" images={mealImages} />
    <Carousel height="500" width="600" images={fypImages} />
</div>

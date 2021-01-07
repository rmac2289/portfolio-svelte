<script>
    import Carousel from "../utils/Carousel.svelte";
    import { readableStore } from "../../store";
    let safetyImages = $readableStore.safetyBlanket.images;
</script>

<style>
    .container {
        max-width: 400px;
    }
</style>

<div class="container">
    <div><img width="400" src={safetyImages[0]} alt="img" /></div>
    {#if false}
        <Carousel height="300" width="175" images={safetyImages} />
    {/if}
</div>

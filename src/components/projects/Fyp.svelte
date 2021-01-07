<script>
    import Carousel from "../utils/Carousel.svelte";
    import { readableStore } from "../../store";
    let fypImages = $readableStore.fyp.images;
</script>

<style>
    .container {
        max-width: 400px;
    }
</style>

<div class="container">
    <div><img width="400" src={fypImages[0]} alt="img" /></div>
    {#if false}
        <Carousel height="300" width="150" images={fypImages} />
    {/if}
</div>

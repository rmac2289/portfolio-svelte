<script>
    import Carousel from "../utils/Carousel.svelte";
    import { readableStore } from "../../store";
    let fypMobileImages = $readableStore.fypMobile.images;
</script>

<style>
    .container {
        max-width: 400px;
    }
</style>

<div class="container">
    <div><img width="400" src={fypMobileImages[0]} alt="img" /></div>
    {#if false}
        <Carousel height="250" width="300" images={fypMobileImages} />
    {/if}
</div>

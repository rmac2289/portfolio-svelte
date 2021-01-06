<script>
    export let images = [];
    import { flip } from "svelte/animate";
    import { quartInOut, sineInOut, sineOut } from "svelte/easing";
    let currentIdx = 0;
    const next = () => {
        currentIdx = (currentIdx + 1) % images.length;
    };
    const prev = () => {
        if (currentIdx === 0) {
            currentIdx = images.length - 1;
        } else {
            currentIdx = (currentIdx - 1) % images.length;
        }
    };
    import { slide, blur } from "svelte/transition";
</script>

<style>
    .container {
        width: 350px;
        height: 600px;
        position: relative;
    }
    .next-container,
    .prev-container {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgb(0, 0, 0, 0.5);
        cursor: pointer;
        transition: 0.75s all linear;
    }
    .next-container {
        right: -20px;
        height: 600px;
        width: 20px;
    }
    .prev-container {
        left: -20px;
        height: 600px;
        width: 20px;
    }
    .prev-container:hover,
    .next-container:hover {
        background: rgb(0, 0, 0, 0.3);
    }
    i {
        font-size: 42px;
        color: rgb(255, 255, 255, 0.5);
    }
</style>

<div class="container">
    <div on:click={prev} class="next-container">
        <div class="next"><i class="fas fa-caret-right" /></div>
    </div>
    <div on:click={next} class="prev-container">
        <div class="prev"><i class="fas fa-caret-left" /></div>
    </div>
    {#each [images[currentIdx]] as photo (currentIdx)}
        <img
            height="600"
            width="350"
            transition:blur={{ duration: 600 }}
            src={photo}
            alt="carousel"
            animate:flip />
    {/each}
</div>

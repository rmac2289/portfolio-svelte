<script>
    export let images = [];
    export let height;
    export let width;
    import { flip } from "svelte/animate";
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

    import { blur } from "svelte/transition";
</script>

<style>
    .container {
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
        width: 20px;
    }
    .prev-container {
        left: -20px;
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

<div class="container" style={`height:${height}px; width:${width}px;`}>
    <div on:click={prev} class="next-container" style={`height: ${height}px`}>
        <div class="next"><i class="fas fa-caret-right" /></div>
    </div>
    <div on:click={next} class="prev-container" style={`height: ${height}px`}>
        <div class="prev"><i class="fas fa-caret-left" /></div>
    </div>
    {#each [images[currentIdx]] as photo (currentIdx)}
        <img
            height={`${height}`}
            width={`${width}`}
            transition:blur={{ duration: 600 }}
            src={photo}
            alt="carousel"
            animate:flip />
    {/each}
</div>

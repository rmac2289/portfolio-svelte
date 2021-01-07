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
        currentIdx === 0
            ? (currentIdx = images.length - 1)
            : (currentIdx = (currentIdx - 1) % images.length);
    };

    import { blur, fade } from "svelte/transition";
</script>

<style>
    .container {
        position: relative;
    }
    .controls {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        background: transparent;
        display: flex;
        justify-content: space-between;
    }
    .prev,
    .next {
        width: 100%;
        height: 20px;
        width: 20px;
        padding: 15px;
    }
    .prev {
        text-align: left;
    }
    .next {
        text-align: right;
    }
    i {
        font-size: 24px;
        color: rgb(255, 255, 255);
    }
</style>

{#each [images[currentIdx]] as photo (currentIdx)}
    <div
        transition:blur={{ duration: 600 }}
        animate:flip
        class="container"
        style={`height:${height}px; width:${width}px;`}>
        <div transition:blur={{ duration: 600 }} class="controls">
            <div on:click={next} class="prev">
                <i class="fas fa-chevron-left" />
            </div>
            <div on:click={prev} class="next">
                <i class="fas fa-chevron-right" />
            </div>
        </div>
        <img
            height={`${height}`}
            width={`${width}`}
            src={photo}
            alt="carousel" />
    </div>
{/each}

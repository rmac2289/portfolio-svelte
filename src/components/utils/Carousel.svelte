<script>
  export let images = [];
  export let projectClass;
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";
  export let openCarousel;
  let currentIdx = 0;
  const next = () => {
    currentIdx = (currentIdx + 1) % images.length;
  };
  const prev = () => {
    currentIdx === 0
      ? (currentIdx = images.length - 1)
      : (currentIdx = (currentIdx - 1) % images.length);
  };

  import { blur } from "svelte/transition";
</script>

<div on:click={next} class="prev"><i class="fas fa-chevron-left" /></div>
{#each [images[currentIdx]] as photo (currentIdx)}
  <div animate:flip class="container {projectClass}">
    <div class="controls" />
    <img
      in:blur={{ duration: 400 }}
      src={photo.src}
      alt={photo.name}
      class={projectClass}
    />
  </div>
{/each}
<div on:click={prev} class="next"><i class="fas fa-chevron-right" /></div>
<div
  in:fly={{ y: -50 }}
  out:fly={{ y: -50 }}
  class="close-button"
  on:click={openCarousel}
>
  <p class="close-button-text">X</p>
</div>

<style>
  .container {
    position: relative;
    box-shadow: var(--main-shadow);
  }
  .close-button {
    position: fixed;
    top: 5px;
    right: 7px;
    height: 50px;
    width: 50px;
    z-index: 9999;
    background: white;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .close-button:active {
    transform: scale(0.9);
  }
  .close-button-text {
    color: rgba(6, 15, 6);
    font-size: 28px;
  }
  .meal-generator {
    height: 374px;
    width: 310px;
  }
  .fyp {
    height: 300px;
    width: 310px;
  }
  .fyp-mobile {
    height: 540px;
    width: 300px;
  }
  .portfolio {
    width: 300px;
  }
  .hearsay, .uxDashboard{
    width: 300px;
    height: 224px;
  }
  .safety-blanket,
  .overtime-tracker {
    height: 533px;
    width: 300px;
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
    cursor: pointer;
    justify-content: center;
    align-items: center;
    display: flex;
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
  @media only screen and (min-width: 720px) {
    .meal-generator {
      height: 604px;
      width: 500px;
    }
    .fyp {
      height: 520px;
      width: 500px;
    }
    .fyp-mobile {
      width: 350px;
      height: 630px;
    }
    .hearsay {
      height: 500px;
      width: 671px;
    }
    .uxDashboard {
      height: 600px;
      width: 1100px
    }
    .portfolio {
      width: 600px;
    }
    .safety-blanket,
    .overtime-tracker {
      width: 400px;
      height: 711px;
    }
  }
</style>

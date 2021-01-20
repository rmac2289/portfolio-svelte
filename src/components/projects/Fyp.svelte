<script>
  import Carousel from "../utils/Carousel.svelte";
  import { store, darkmode } from "../../store";
  import { fade } from "svelte/transition";
  let fypImages = $store.fyp.images;
  let techUsed = $store.fyp.tech;
  import ProjectTechGrid from "../utils/ProjectTechGrid.svelte";
  let carouselOpen = false;
  function openCarousel() {
    carouselOpen = !carouselOpen;
  }
  function clickOutsideClose(e) {
    if (carouselOpen && e.target.className.includes("carousel-container")) {
      carouselOpen = !carouselOpen;
    }
    return;
  }
</script>

<div class={$darkmode ? "container-dark" : "container"}>
  <header>
    <div class="title">
      <h2>Find Your Park</h2>
      <div on:click={openCarousel} class="image-icon">
        <i class="fas fa-photo-video" />
      </div>
    </div>
    <div class="header-left">
      <ProjectTechGrid {techUsed} />
    </div>
    <img
      on:click={openCarousel}
      class="thumbnail"
      src="images/fyp/fypHome.jpg"
      alt="fyp"
    />
  </header>
  <div>
    <p>
      A full-stack application for Californians looking to head outdoors. The
      app allows a user to find parks in their area via several different search
      methods. I built this because of what I saw as a shortage of aggregated
      data on parks run by different agencies (state, national, county, etc.).
      Through further data aggregation, the app will soon be available for other
      states.
    </p>
  </div>
  {#if carouselOpen}
    <div
      transition:fade
      on:click={clickOutsideClose}
      class="carousel-container"
    >
      <Carousel {openCarousel} projectClass="fyp" images={fypImages} />
    </div>
  {/if}
</div>

<style>
  .container {
    background: rgb(0, 0, 0, 0.5);
    padding: 1rem;
    box-shadow: var(--main-shadow);
    transition: 0.75s all linear;
  }
  .container-dark {
    background: rgb(0, 0, 0, 0.5);
    padding: 1rem;
    box-shadow: var(--dark-shadow);
  }
  h2 {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 900;
    margin: 0;
    width: 75%;
    text-align: left;
    font-family: "Lato", sans-serif;
  }
  .title {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    margin: 0;
    height: 50px;
    background: rgb(0, 0, 0, 0.35);
    display: flex;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    align-items: center;
    box-shadow: var(--main-shadow);
  }
  .image-icon {
    width: 25%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    cursor: pointer;
  }
  i {
    color: rgba(255, 255, 255, 0.95);
    font-size: 28px;
  }
  .thumbnail {
    display: none;
    padding: 0;
    box-shadow: var(--main-shadow);
    z-index: 9997;
    margin: 25px;
    width: 300px;
    height: 300px;
    cursor: pointer;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.25);
    box-shadow: var(--main-shadow);
    padding: 0.5rem;
    position: relative;
  }
  .header-left {
    width: 95%;
    margin-left: auto;
    margin-right: auto;
  }
  p {
    color: rgba(255, 255, 255, 0.95);
    font-size: 1.25em;
  }
  @media only screen and (min-width: 720px) {
    .container,
    .container-dark {
      min-width: 400px;
    }
  }
  @media only screen and (min-width: 900px) {
    i {
      display: none;
    }
    header {
      flex-direction: row;
      justify-content: initial;
    }
    .header-left {
      width: 85%;
    }
    .thumbnail {
      display: initial;
      margin: initial;
      width: 250px;
      height: 250px;
    }
  }
</style>

<script>
  import Carousel from "../utils/Carousel.svelte";
  import { store, darkmode } from "../../store";
  import { fade, fly } from "svelte/transition";
  let safetyImages = $store.safetyBlanket.images;
  let techUsed = $store.safetyBlanket.tech;
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
      <h2>Safety Blanket</h2>
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
      width="150"
      src="images/safetyblanket/safetyHome.png"
      alt="fyp"
    />
  </header>
  <div>
    <p>
      Safety Blanket is a full stack mobile app that provides users with
      emergency and non-emergency public safety help at their fingertips. A
      user's geolocation is used to find agencies closest to them. The landing
      screen give the user the option to call an agency, open up the location in
      google maps, or to save the contact information in their phone.
    </p>
  </div>
  {#if carouselOpen}
    <div
      transition:fade
      on:click={clickOutsideClose}
      class="carousel-container"
    >
      <Carousel
        {openCarousel}
        projectClass="safety-blanket"
        images={safetyImages}
      />
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
  .container-dark {
    background: rgb(0, 0, 0, 0.5);
    padding: 1rem;
    transition: 0.75s all linear;
    box-shadow: var(--dark-shadow);
  }
  h2 {
    color: rgba(255, 255, 255, 0.95);
    text-align: left;
    width: 75%;
    font-weight: 900;
    margin: 0;
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
  .thumbnail {
    display: none;
    padding: 0;
    box-shadow: var(--main-shadow);
    z-index: 9997;
    margin: 25px;
    cursor: pointer;
  }
  header {
    display: flex;
    align-items: center;
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
    .thumbnail {
      display: initial;
    }
    .header-left {
      width: 85%;
    }
    i {
      display: none;
    }
  }
</style>

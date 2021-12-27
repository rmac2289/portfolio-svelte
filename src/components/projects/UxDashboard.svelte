<script>
  import Carousel from "../utils/Carousel.svelte";
  import { store, darkmode } from "../../store";
  import { fade, fly } from "svelte/transition";
  let uxImages = $store.uxDashboard.images;
  let techUsed = $store.uxDashboard.tech;
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

<style>
  .container {
    background: rgb(0, 0, 0, 0.5);
    padding: 1rem;
    box-shadow: var(--main-shadow);
    transition: 0.75s all linear;
  }
  span {
    font-family: "Lato", sans-serif;

    font-size: 75%;
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

<div class={$darkmode ? 'container-dark' : 'container'}>
  <header>
    <div class="title">
      <h2>Test Data - Axos Bank</h2>
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
      width="350"
      src="images/dashboardscreenshot.PNG"
      alt="UX Dashboard" />
  </header>
  <div>
    <p>
      Designed, wrote and implemented a data pipeline from the Testim.io test
      automation framework. I extracted data from within the framework by
      building a node.js/express api, which dumped the data into an
      Elasticsearch cluster. I visualized the data in Kibana to enable teams to
      check on the performance metrics of their applications in different
      testing and production environments.
      <br /><br /><span>*Images shown do not use actual company data</span>
    </p>
  </div>
  {#if carouselOpen}
    <div
      transition:fade
      on:click={clickOutsideClose}
      class="carousel-container">
      <Carousel {openCarousel} projectClass="uxDashboard" images={uxImages} />
    </div>
  {/if}
</div>

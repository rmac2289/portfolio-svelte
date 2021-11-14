<script>
  import Layout from "./utils/Layout.svelte";
  import { store, darkmode } from "../store";
  import { fly } from "svelte/transition";
  import Experience from '../experience.md'
  let y;
</script>

<svelte:window bind:scrollY={y} />
<svelte:head>
  <title>Experience</title>
</svelte:head>
<Layout>
  <h1 class="header">Experience</h1>
  <!-- <p class="main-p">
    {$store.experience1}
    <br />
    <br />
    {$store.experience2}
    <br />
    <br />
    {$store.experience3}
    <br />
    <br />
    {$store.experience4}
  </p> -->
  <div class="main-p">
  <Experience />
</div>
  {#if y > 50 || window.innerWidth > 1500}
    <h1 in:fly={{ y: 1000, duration: 750 }} class="header">Tech</h1>
    <div in:fly={{ y: 1000, duration: 750 }} class="tech-grid">
      {#each $store.tech as tech}
        <a href={tech.href} class={$darkmode ? "icon-box icon-box-dark" : "icon-box"} target="_blank">
          {#if tech.class}
            <i class={tech.class} style="color:{tech.color}" />
          {:else}
            <img src={tech.src} alt={tech.name} height="30" />
          {/if}
          <div class="name">
            <p id="name"> {tech.name} </p>
          </div>
        </a>
      {/each}
    </div>
    <h1 in:fly={{ y: 1000, duration: 750 }} class="header">
      Skills
    </h1>

    <div in:fly={{ y: 1000, duration: 750 }} class="tech-grid">
      {#each $store.learning as learning}
        <div class={$darkmode ? "icon-box icon-box-dark" : "icon-box"}>
          {#if learning.class}
            <i class={learning.class} style="color:{learning.color}"  />
          {:else}
            <img src={learning.src} alt={learning.name} height="30" />
          {/if}
          <div class="name">
            <p id="name">{learning.name}</p>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</Layout>

<style>
  a {
    color: white;
  }
  .header {
    color: white;
    padding-left: 1rem;
  }
 
  div {
    color: white;
  }
  .main-p {
    color: white;
    font-size: 1.25em;
    border-left: 1px solid rgb(255, 255, 255, 0.5);
    padding: 1rem;
    font-weight: initial;
    transition: 1s all linear;
  }
  i {
    font-size: 1.75rem;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: left;
    align-items: center;
  }
  .tech-grid {
    padding: 1rem;
    border-left: 1px solid rgb(255, 255, 255, 0.5);
    display: grid;
    grid-template-columns: repeat(1fr 1fr);
    gap: 5px;
    margin-bottom: 25px;
  }
  .icon-box {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    padding: 0.15rem;
    padding-left: 1rem;
    padding-right: 1rem;
    border-radius: 1px;
    background: rgb(0, 0, 0, 0.5);
    box-shadow: var(--main-shadow);
    transition: 0.5s all linear;
    border: 1px solid transparent;
    align-items: center;
    justify-content: left;
  }
  .icon-box-dark {
    box-shadow: var(--dark-shadow);
  }
  .icon-box:hover {
    background: rgb(0, 0, 0, 0.75);
    transform: scale(1.075) rotateY(18deg);
   
  }
  .img {
    height: 30px;
    width: 30px;
  }
  .name {
    display: flex;
    height: 100%;
    width: 100%;
    align-items: center;
    justify-content: flex-end;
    grid-column: 2/5;
  }
  .mongodb {
    width: 15px;
    height: 30px;
  }
  @media only screen and (min-width: 520px) {
    .tech-grid {
      grid-template-columns: 1fr 1fr 1fr;
    }
  }
  @media only screen and (min-width: 900px) {
    .tech-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
  }
</style>

<script>
    import Carousel from "../utils/Carousel.svelte";
    import { readableStore } from "../../store";
    let fypMobileImages = $readableStore.fypMobile.images;
    let techUsed = $readableStore.fypMobile.tech;
    import { fly } from "svelte/transition";
    import ProjectTechGrid from "../utils/ProjectTechGrid.svelte";
</script>

<style>
    .container {
        background: rgb(0, 0, 0, 0.5);
        padding: 1rem;
        min-width: 400px;
        box-shadow: var(--main-shadow);
    }
    h2 {
        color: rgba(255, 255, 255, 0.95);
        text-align: center;
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
        justify-content: flex-start;
        padding-left: 1.5rem;
        align-items: center;
        box-shadow: var(--main-shadow);
    }
    .thumbnail {
        padding: 0;
        box-shadow: var(--main-shadow);
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
        width: 85%;
        margin-left: auto;
        margin-right: auto;
        margin: 0;
        margin-right: 0.5rem;
    }
    p {
        color: rgba(255, 255, 255, 0.95);
        font-size: 1.25em;
    }
</style>

<div class="container">
    <header>
        <div class="title">
            <h2>Find Your Park Mobile</h2>
        </div>
        <div class="header-left">
            <ProjectTechGrid {techUsed} />
        </div>
        <img class="thumbnail" width="125" src={fypMobileImages[0]} alt="fyp" />
    </header>
    <div>
        <p>
            The Find Your Park iOS mobile app. Built with React Native, the app
            uses similar logic to the original app but refactored to native
            standards. Mobile version contains all functionality of the web app,
            with slightly different formatting. Available now on the Apple App
            Store.
        </p>
    </div>
    <!-- <Carousel height="400" width="185" images={fypMobileImages} /> -->
</div>

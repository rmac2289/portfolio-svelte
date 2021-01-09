<script>
    import Layout from "./utils/Layout.svelte";
    import { store } from "../store";
    import { fly } from "svelte/transition";
    let y;
</script>

<style>
    .header {
        color: white;
        padding-left: 1rem;
    }
    p {
        color: white;
        font-size: 1.25em;
        font-weight: 800;
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
    }
    img {
        height: 30px;
        width: 30px;
    }
    .tech-grid {
        padding: 1rem;
        border-left: 1px solid rgb(255, 255, 255, 0.5);
        display: grid;
        grid-template-columns: repeat(1fr 1fr);
        gap: 5px;
    }
    .icon-box {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        padding: 0.5rem;
        padding-left: 1rem;
        padding-right: 1rem;
        border-radius: 1px;
        background: rgb(0, 0, 0, 0.5);
        transition: 0.5s all ease-in;
    }
    .icon-box:hover {
        background: rgb(0, 0, 0, 0.75);
        transform: scale(1.1);
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
        i {
            font-size: 2.5rem;
            padding-right: 1rem;
        }
        img {
            padding-right: 1rem;
            width: 40px;
            height: 40px;
        }
        .mongodb {
            width: 20px;
            height: 40px;
        }
    }
</style>

<svelte:window bind:scrollY={y} />
<svelte:head>
    <title>Experience</title>
</svelte:head>
<Layout>
    <h1 class="header">Experience</h1>
    <p class="main-p">
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
    </p>
    {#if y > 100}
        <h1 in:fly={{ y: 1000, duration: 750 }} class="header">Tech</h1>
        <div in:fly={{ y: 1000, duration: 750 }} class="tech-grid">
            {#each $store.tech as tech}
                <div class="icon-box">
                    {#if tech.class[0] === 'f'}
                        <i class={tech.class} style="color:{tech.color}" />
                    {/if}
                    {#if tech.class === '' && tech.name !== 'mongoDB'}
                        <img src={tech.src} alt={tech.name} />
                    {/if}
                    {#if tech.name === 'mongoDB'}
                        <img class="mongodb" src={tech.src} alt="mongodb" />
                    {/if}
                    <div class="name">
                        <div id="name">{tech.name}</div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</Layout>

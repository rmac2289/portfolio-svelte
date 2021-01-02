<script>
    import Layout from "./Layout.svelte";
    import { readableStore } from "../store";
    import { fly } from "svelte/transition";
    let y;
    let postgres = "images/elephant.png";
    let svelte = "images/svelte.png";
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
    i,
    svg {
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
        grid-template-columns: repeat(3, 1fr);
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
    @media only screen and (min-width: 720px) {
        .tech-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
        }
        i,
        svg {
            font-size: 2.5rem;
            padding-right: 1rem;
        }
        img {
            padding-right: 1rem;
            width: 40px;
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
        {$readableStore.experience1}
        <br />
        <br />
        {$readableStore.experience2}
        <br />
        <br />
        {$readableStore.experience3}
        <br />
        <br />
        {$readableStore.experience4}
    </p>
    {#if y > 100}
        <h1 in:fly={{ y: 1000, duration: 750 }} class="header">Tech</h1>
        <div in:fly={{ y: 1000, duration: 750 }} class="tech-grid">
            {#each $readableStore.tech as tech}
                <div class="icon-box">
                    {#if tech.class[0] === 'f'}
                        <i class={tech.class} style="color:{tech.color}" />
                    {/if}
                    {#if tech.name === 'mongoDB'}
                        <svg height="45" width="22" viewBox="0 0 13 26"><path
                                d="M11.7 10.4C10.3 4.3 7.4 2.7 6.7 1.6 6.3 1.1 6.1 0.5 5.8 0 5.8 0.5 5.7 0.9 5.3 1.3 4.3 2.1 0.4 5.3 0 12.2-0.3 18.7 4.8 22.6 5.5 23 6 23.3 6.7 23 7 22.8 9.4 21.1 12.8 16.7 11.7 10.4"
                                fill="#10AA50" />
                            <path
                                d="M6 19.5C5.8 21.1 5.7 22 5.4 22.9 5.4 22.9 5.6 24.4 5.8 26L6.3 26C6.5 24.9 6.7 23.8 6.9 22.7 6.2 22.3 6 20.9 6 19.5Z"
                                fill="#B8C4C2" />
                            <path
                                d="M7 22.8L7 22.8C6.3 22.4 6.1 20.9 6.1 19.6 6.3 17.3 6.3 15 6.3 12.6 6.2 11.4 6.3 1.5 6 0 6.2 0.5 6.4 1 6.7 1.4 7.4 2.6 10.3 4.2 11.7 10.3 12.8 16.6 9.5 21.1 7 22.8Z"
                                fill="#12924F" /></svg>
                    {/if}
                    {#if tech.name === 'postgres'}
                        <img src={postgres} alt="postgres" />
                    {/if}
                    {#if tech.name === 'svelte'}
                        <img src={svelte} alt="svelte" />
                    {/if}
                    <div class="name">
                        <div id="name">{tech.name}</div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</Layout>

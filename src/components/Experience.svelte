<script>
    import Layout from "./Layout.svelte";
    import { store } from "../store";
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
    .main-p {
        color: white;
        font-size: 1.25em;
        border-left: 1px solid rgb(255, 255, 255, 0.5);
        padding: 1rem;
        font-weight: initial;
    }
    i {
        font-size: 2.5rem;
        color: white;
        margin-right: 10px;
    }
    .tech-grid {
        padding: 1rem;
        border-left: 1px solid rgb(255, 255, 255, 0.5);
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
    }
    .icon-box {
        display: flex;
        align-items: center;
        justify-self: stretch;
    }

    @media only screen and (min-width: 720px) {
        .tech-grid {
            grid-template-columns: repeat(5, 1fr);
        }
    }
</style>

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
    <h1 class="header">Tech</h1>
    <div class="tech-grid">
        {#each $store.tech as tech}
            <div class="icon-box">
                <i class={tech.class} />
                <p>{tech.name}</p>
            </div>
        {/each}
    </div>
</Layout>

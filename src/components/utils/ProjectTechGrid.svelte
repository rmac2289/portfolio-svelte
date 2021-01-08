<script>
    export let techUsed;
</script>

<style>
    p {
        color: rgba(255, 255, 255, 0.95);
        font-size: 1.25em;
    }
    .tech-grid {
        display: grid;
        grid-template-columns: 1fr;
        text-align: center;
        gap: 20px;
        margin-top: 50px;
    }
    .grid-subtitle {
        font-weight: 900;
        border-bottom: 0.5px solid rgb(255, 255, 255, 0.5);
        color: white;
        font-size: 22px;
        margin: 5px;
        text-align: left;
        padding-left: 0.5rem;
    }
    .grid-item > p {
        margin: 0;
    }
    .grid-title {
        background: rgb(0, 0, 0, 0.2);
        box-shadow: var(--main-shadow);
    }
    .grid-item {
        margin: 0;
        justify-content: space-between;
        display: flex;
        align-items: center;
        padding-left: 1rem;
        padding-right: 1rem;
        margin-bottom: 5px;
    }
    img {
        height: 30px;
        width: 30px;
    }
    i {
        color: rgba(255, 255, 255, 0.95);
        height: 25px;
        width: 25px;
        font-size: 22px;
    }
    @media only screen and (min-width: 600px) {
        .tech-grid {
            grid-template-columns: 1fr 1fr;
        }
    }
    @media only screen and (min-width: 1024px) {
        .tech-grid {
            grid-template-columns: 1fr 1fr 1fr;
        }
    }
</style>

<div class="tech-grid">
    <div class="grid-title">
        <h4 class="grid-subtitle">Frontend</h4>
        {#each techUsed.frontend as tech}
            <div class="grid-item">
                <p>{tech.name}</p>
                {#if tech.src}
                    <img src={tech.src} alt={tech.name} />
                {:else}<i style="color: {tech.color}" class={tech.class} />{/if}
            </div>
        {/each}
    </div>
    {#if techUsed.backend}
        <div class="grid-title">
            <h4 class="grid-subtitle">Backend</h4>
            {#each techUsed.backend as tech}
                <div class="grid-item">
                    <p>{tech.name}</p>
                    {#if tech.src}
                        <img src={tech.src} alt={tech.name} />
                    {:else}
                        <i style="color: {tech.color}" class={tech.class} />
                    {/if}
                </div>
            {/each}
        </div>
    {/if}

    <div class="grid-title">
        <h4 class="grid-subtitle">Misc</h4>
        {#each techUsed.misc as tech}
            <div class="grid-item">
                <p>{tech.name}</p>
                {#if tech.src}
                    <img src={tech.src} alt={tech.name} />
                {:else}<i style="color: {tech.color}" class={tech.class} />{/if}
            </div>
        {/each}
    </div>
</div>

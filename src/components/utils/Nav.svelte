<script>
    import { fly } from "svelte/transition";
    let open = false;
    function setOpen() {
        open = !open;
    }
    import { links } from "svelte-routing";
    import { darkmode } from "../../store";
    let y;
    console.dir(window);
</script>

<style>
    .nav {
        display: grid;
        grid-template-columns: 1fr;
        height: 100vh;
        position: fixed;
        z-index: 9998;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
    }
    a {
        transition: 0.25s all linear;
        color: white;
        font-size: 1.5em;
        width: 100%;
        height: 30px;
        margin: auto;
        padding: 30px;
        text-align: center;
    }
    a:hover {
        color: rgba(6, 15, 6);
    }
    .link-div {
        background: rgba(0, 0, 0, 0.75);
        border: 2px solid white;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: 0.5s all ease;
        cursor: pointer;
    }
    .dark {
        background: rgba(0, 0, 0, 0.9);
    }
    .link-div:hover {
        background: rgb(255, 255, 255, 0.8);
    }
    .open-button {
        position: fixed;
        top: 0;
        left: 50%;
        width: 100px;
        margin-left: -50px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        padding-left: 5px;
        z-index: 9999;
    }
    .open-button-text {
        color: white;
        font-size: 2.5rem;
        transform: rotate(90deg);
    }
    .close-button {
        position: fixed;
        top: 5px;
        right: 7px;
        height: 50px;
        width: 50px;
        z-index: 9999;
        background: white;
        z-index: 9999;
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
</style>

<svelte:window bind:scrollY={y} />

<nav use:links>
    {#if !open}
        {#if y < 150}
            <div
                aria-label="Open Navigation"
                in:fly={{ delay: 500, y: -100, duration: 1000 }}
                out:fly={{ duration: 1000, y: -100 }}
                class={'open-button'}
                on:mouseenter={setOpen}>
                <p class="open-button-text">|||</p>
            </div>
        {/if}
    {:else}
        <div
            aria-label="Close Navigation"
            in:fly={{ delay: 700, y: -50 }}
            out:fly={{ y: -50 }}
            class={'close-button'}
            on:click={setOpen}>
            <p class="close-button-text">X</p>
        </div>
    {/if}
    {#if open}
        <div class="nav">
            <div
                on:click={setOpen}
                class={$darkmode ? 'link-div dark' : 'link-div'}
                in:fly={{ duration: 1000, y: 100 }}
                out:fly={{ duration: 1000, delay: 600, y: 700 }}>
                <a href="/">home</a>
            </div>
            <div
                on:click={setOpen}
                class={$darkmode ? 'link-div dark' : 'link-div'}
                in:fly={{ duration: 1000, delay: 200, y: 100 }}
                out:fly={{ duration: 1000, delay: 500, y: 600 }}>
                <a href="/experience">experience</a>
            </div>
            <div
                on:click={setOpen}
                class={$darkmode ? 'link-div dark' : 'link-div'}
                in:fly={{ duration: 1000, delay: 300, y: 100 }}
                out:fly={{ duration: 1000, delay: 400, y: 500 }}>
                <a className="contact" href="/projects"> my work </a>
            </div>
            <div
                on:click={setOpen}
                class={$darkmode ? 'link-div dark' : 'link-div'}
                in:fly={{ duration: 1000, delay: 400, y: 100 }}
                out:fly={{ duration: 1000, delay: 300, y: 400 }}>
                <a href="/resume"> resume </a>
            </div>
            <div
                on:click={setOpen}
                onclick="location.href='https://ross-scott-macdonald.medium.com'"
                class={$darkmode ? 'link-div dark' : 'link-div'}
                in:fly={{ duration: 1000, delay: 300, y: 100 }}
                out:fly={{ duration: 1000, delay: 200, y: 300 }}>
                <a
                    id="blog"
                    href="https://ross-scott-macdonald.com/blog"
                    target="_blank"
                    rel="noopener noreferrer">
                    blog
                </a>
            </div>
            <div
                on:click={setOpen}
                class={$darkmode ? 'link-div dark' : 'link-div'}
                in:fly={{ duration: 1000, delay: 500, y: 100 }}
                out:fly={{ duration: 1000, delay: 100, y: 200 }}>
                <a className="contact" href="/contact"> contact </a>
            </div>
        </div>
    {/if}
</nav>

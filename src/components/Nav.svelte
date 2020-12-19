<script>
    import { fly, fade } from "svelte/transition";
    let open = false;
    function setOpen() {
        open = !open;
    }
</script>

<style>
    .nav {
        display: grid;
        grid-template-columns: 1fr;
        height: 100vh;
        position: absolute;
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
        font-family: "Lato", sans-serif;
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
    .link-div:hover {
        transform: scale(1.1);
        background: rgb(255, 255, 255, 0.8);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
    }
    .open-button-text {
        color: white;
        font-family: "Lato", sans-serif;
        font-size: 2.5rem;
        transform: rotate(90deg);
    }
    .close-button {
        position: absolute;
        top: 5px;
        right: 7px;
        height: 50px;
        width: 50px;
        background: white;
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }
    .close-button-text {
        color: rgba(6, 15, 6);
        font-family: "Lato", sans-serif;
        font-size: 28px;
    }
    .hidden {
        display: none;
    }
    @media only screen and (min-width: 520px) {
    }
</style>

<nav>
    <div
        in:fade={{ delay: 600 }}
        class={open ? 'hidden' : 'open-button'}
        on:mouseenter={setOpen}>
        <p class="open-button-text">|||</p>
    </div>
    <div class={!open ? 'hidden' : 'close-button'} on:click={setOpen}>
        <p class="close-button-text">X</p>
    </div>
    {#if open}
        <div class="nav">
            <div
                onclick="location.href='/'"
                class="link-div one"
                in:fly={{ duration: 1000, y: 100 }}
                out:fly={{ duration: 1000, delay: 600, y: 700 }}>
                <a href="/">home</a>
            </div>
            <div
                onclick="location.href='/about'"
                class="link-div two"
                in:fly={{ duration: 1000, delay: 100, y: 100 }}
                out:fly={{ duration: 1000, delay: 500, y: 600 }}>
                <a href="/about">about</a>
            </div>
            <div
                onclick="location.href='/experience'"
                class="link-div three"
                in:fly={{ duration: 1000, delay: 200, y: 100 }}
                out:fly={{ duration: 1000, delay: 400, y: 500 }}>
                <a href="/experience">experience</a>
            </div>
            <div
                onclick="location.href='https://ross-scott-macdonald.com/blog'"
                class="link-div four"
                in:fly={{ duration: 1000, delay: 300, y: 100 }}
                out:fly={{ duration: 1000, delay: 300, y: 400 }}>
                <a
                    id="blog"
                    href="https://ross-scott-macdonald.com/blog"
                    target="_blank"
                    rel="noopener noreferrer">
                    blog
                </a>
            </div>
            <div
                onclick="location.href='/resume'"
                class="link-div five"
                in:fly={{ duration: 1000, delay: 400, y: 100 }}
                out:fly={{ duration: 1000, delay: 200, y: 300 }}>
                <a href="/resume"> resume </a>
            </div>
            <div
                onclick="location.href='/contact'"
                class="link-div six"
                in:fly={{ duration: 1000, delay: 500, y: 100 }}
                out:fly={{ duration: 1000, delay: 100, y: 200 }}>
                <a className="contact" href="/contact"> contact </a>
            </div>
            <div
                onclick="location.href='/projects'"
                class="link-div seven"
                in:fly={{ duration: 1000, delay: 600, y: 100 }}
                out:fly={{ duration: 1000, y: 100 }}>
                <a className="contact" href="/projects"> projects </a>
            </div>
        </div>
    {/if}
</nav>

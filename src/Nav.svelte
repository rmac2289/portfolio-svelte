<script>
    import { fade } from "svelte/transition";
    import FaAlignJustify from "svelte-icons/fa/FaAlignJustify.svelte";
    import { open } from "./store.js";
    const openBurger = () => {
        open.update((val) => !val);
    };
</script>

<style>
    a {
        transition: 0.25s all linear;
        color: white;
        font-size: 1.5em;
        padding: 20px;
    }
    a:hover {
        color: grey;
    }

    .burger {
        margin: 10px;
        position: absolute;
    }

    .icon {
        cursor: pointer;
        width: 32px;
        height: 32px;
        transition: all 0.75s linear;
        color: white;
    }
    .flip {
        transition: all 0.75s linear;
        transform: rotate(90deg);
    }
    .link-div {
        padding: 20px;
        background: black;
        border: 2px solid white;
    }
    @media only screen and (min-width: 520px) {
        .burger {
            width: 600px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 0;
        }
        .four,
        .five,
        .six,
        .seven {
            grid-column: 3;
        }
    }
</style>

<nav>
    <div class={$open ? 'icon flip' : 'icon'} on:click={openBurger}>
        <FaAlignJustify />
    </div>
    {#if $open}
        <div class="burger">
            <div
                class="link-div one"
                in:fade={{ delay: 0, duration: 300 }}
                out:fade={{ delay: 500, duration: 300 }}>
                <a on:click={openBurger} href="/"> home </a>
            </div>
            <div
                class="link-div two"
                in:fade={{ delay: 100, duration: 300 }}
                out:fade={{ delay: 400, duration: 300 }}>
                <a on:click={openBurger} href="/about"> about </a>
            </div>
            <div
                class="link-div three"
                in:fade={{ delay: 200, duration: 300 }}
                out:fade={{ delay: 300, duration: 300 }}>
                <a on:click={openBurger} href="/experience"> experience </a>
            </div>
            <div
                class="link-div four"
                in:fade={{ delay: 300, duration: 300 }}
                out:fade={{ delay: 200, duration: 300 }}>
                <a
                    on:click={openBurger}
                    id="blog"
                    href="https://ross-scott-macdonald.com/blog"
                    target="_blank"
                    rel="noopener noreferrer">
                    blog
                </a>
            </div>
            <div
                class="link-div five"
                in:fade={{ delay: 400, duration: 300 }}
                out:fade={{ delay: 100, duration: 300 }}>
                <a on:click={openBurger} href="/resume"> resume </a>
            </div>
            <div
                class="link-div six"
                in:fade={{ delay: 500, duration: 300 }}
                out:fade={{ delay: 0, duration: 300 }}>
                <a on:click={openBurger} className="contact" href="/contact">
                    contact
                </a>
            </div>
            <div
                class="link-div seven"
                in:fade={{ delay: 500, duration: 300 }}
                out:fade={{ delay: 0, duration: 300 }}>
                <a on:click={openBurger} className="contact" href="/projects">
                    projects
                </a>
            </div>
        </div>
    {/if}
</nav>

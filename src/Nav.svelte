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
    }
    a:hover {
        color: grey;
    }
    .burger {
        display: flex;
        flex-direction: column;
        position: absolute;
        left: 0;
    }
    .burger {
        margin: 10px;
    }
    .burger > div {
        margin: 10px;
    }
    .icon {
        cursor: pointer;
        width: 32px;
        height: 32px;
        transition: all 0.75s linear;
    }
    .flip {
        transition: all 0.75s linear;
        transform: rotate(90deg);
    }
    .link-div {
        width: 200px;
        background: black;
        padding: 20px;
    }
</style>

<nav>
    <div class={$open ? 'icon flip' : 'icon'} on:click={openBurger}>
        <FaAlignJustify />
    </div>
    {#if $open}
        <div class="burger">
            <div
                class="link-div"
                in:fade={{ delay: 0, duration: 300 }}
                out:fade={{ delay: 500, duration: 300 }}>
                <a href="/"> home </a>
            </div>
            <div
                class="link-div"
                in:fade={{ delay: 100, duration: 300 }}
                out:fade={{ delay: 400, duration: 300 }}>
                <a href="/about"> about </a>
            </div>
            <div
                class="link-div"
                in:fade={{ delay: 200, duration: 300 }}
                out:fade={{ delay: 300, duration: 300 }}>
                <a href="/experience"> experience </a>
            </div>
            <div
                class="link-div"
                in:fade={{ delay: 300, duration: 300 }}
                out:fade={{ delay: 200, duration: 300 }}>
                <a
                    id="blog"
                    href="https://ross-scott-macdonald.com/blog"
                    target="_blank"
                    rel="noopener noreferrer">
                    blog
                </a>
            </div>
            <div
                class="link-div"
                in:fade={{ delay: 400, duration: 300 }}
                out:fade={{ delay: 100, duration: 300 }}>
                <a href="/resume"> resume </a>
            </div>
            <div
                class="link-div"
                in:fade={{ delay: 500, duration: 300 }}
                out:fade={{ delay: 0, duration: 300 }}>
                <a className="contact" href="/contact"> contact </a>
            </div>
        </div>
    {/if}
</nav>

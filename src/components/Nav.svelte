<script>
    import { fade } from "svelte/transition";
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

    .nav {
        margin: 10px;
    }
    .link-div {
        padding: 22px;
        background: black;
        border: 2px solid white;
        width: 85px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: 0.5s all ease;
        cursor: pointer;
    }
    .link-div:hover {
        transform: translateX(-25px);
    }
    @media only screen and (min-width: 520px) {
        .nav {
            max-width: 600px;
            display: grid;
            grid-template-columns: 1fr;
        }
    }
</style>

<nav>
    <div class="nav">
        <div
            onclick="location.href='/'"
            class="link-div one"
            in:fade={{ delay: 0, duration: 300 }}
            out:fade={{ delay: 500, duration: 300 }}>
            <a href="/">home</a>
        </div>
        <div
            onclick="location.href='/about'"
            class="link-div two"
            in:fade={{ delay: 100, duration: 300 }}
            out:fade={{ delay: 400, duration: 300 }}>
            <a href="/about">about</a>
        </div>
        <div
            onclick="location.href='/experience'"
            class="link-div three"
            in:fade={{ delay: 200, duration: 300 }}
            out:fade={{ delay: 300, duration: 300 }}>
            <a href="/experience">experience</a>
        </div>
        <div
            onclick="location.href='https://ross-scott-macdonald.com/blog'"
            class="link-div four"
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
            onclick="location.href='/resume'"
            class="link-div five"
            in:fade={{ delay: 400, duration: 300 }}
            out:fade={{ delay: 100, duration: 300 }}>
            <a href="/resume"> resume </a>
        </div>
        <div
            onclick="location.href='/contact'"
            class="link-div six"
            in:fade={{ delay: 500, duration: 300 }}
            out:fade={{ delay: 0, duration: 300 }}>
            <a className="contact" href="/contact"> contact </a>
        </div>
        <div
            onclick="location.href='/projects'"
            class="link-div seven"
            in:fade={{ delay: 500, duration: 300 }}
            out:fade={{ delay: 0, duration: 300 }}>
            <a className="contact" href="/projects"> projects </a>
        </div>
    </div>
</nav>

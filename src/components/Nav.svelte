<script>
    import { fly } from "svelte/transition";
</script>

<style>
    a {
        transition: 0.25s all linear;
        color: white;
        font-size: 1.5em;
        width: 100px;
        height: 30px;
        margin: auto;
        padding: 30px;
        text-align: center;
        font-family: "Lato", sans-serif;
    }
    a:hover {
        color: rgba(6, 15, 6);
    }

    .nav {
        margin: 10px;
    }
    .link-div {
        background: rgba(0, 0, 0, 0.3);
        background-blend-mode: saturation;
        border: 2px solid white;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: 0.5s all ease;
        cursor: pointer;
    }
    .link-div:hover {
        transform: translateX(-25px);
        background: rgb(255, 255, 255, 0.6);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
            in:fly={{ duration: 1000, x: -200 }}>
            <a href="/">home</a>
        </div>
        <div
            onclick="location.href='/about'"
            class="link-div two"
            in:fly={{ duration: 1000, delay: 100, x: 200 }}>
            <a href="/about">about</a>
        </div>
        <div
            onclick="location.href='/experience'"
            class="link-div three"
            in:fly={{ duration: 1000, delay: 200, x: -200 }}>
            <a href="/experience">experience</a>
        </div>
        <div
            onclick="location.href='https://ross-scott-macdonald.com/blog'"
            class="link-div four"
            in:fly={{ duration: 1000, delay: 300, x: 200 }}>
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
            in:fly={{ duration: 1000, delay: 400, x: -200 }}>
            <a href="/resume"> resume </a>
        </div>
        <div
            onclick="location.href='/contact'"
            class="link-div six"
            in:fly={{ duration: 1000, delay: 500, x: 200 }}>
            <a className="contact" href="/contact"> contact </a>
        </div>
        <div
            onclick="location.href='/projects'"
            class="link-div seven"
            in:fly={{ duration: 1000, delay: 600, x: -200 }}>
            <a className="contact" href="/projects"> projects </a>
        </div>
    </div>
</nav>

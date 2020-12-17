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
    }
    a:hover {
        color: rgb(1, 1, 48);
    }

    .nav {
        margin: 10px;
    }
    .link-div {
        background: black;
        border: 2px solid white;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: 0.5s all ease;
        cursor: pointer;
    }
    .link-div:hover {
        transform: translateX(-25px);
        background: white;
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

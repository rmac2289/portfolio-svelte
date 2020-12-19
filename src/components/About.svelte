<script>
</script>

<style>
    .container {
        display: none;
        position: fixed;
        opacity: 0.75;
        top: 10px;
        right: 10px;
        max-width: 600px;
        flex-direction: column;
        justify-content: center;
        padding: 10px;
        align-items: flex-start;
    }
    .corner-sub {
        font-size: 0.75em;
        color: white;
        font-weight: 100;
    }

    .sub-header {
        display: flex;
        align-items: center;
        padding-left: 1px;
    }
    .corner-name {
        margin-bottom: 0;
        font-size: 1.5em;
        font-weight: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        border-bottom: 1px solid rgb(255, 255, 255, 0.5);
    }
    .about-container {
        width: 75%;
        height: 100%;
        margin: 100px auto;
        padding: 1rem;
    }
    .about {
        width: 100%;
        height: 100%;
        padding: 1rem;
    }
    .header {
        color: white;
        padding-left: 1rem;
    }
    p {
        color: white;
        font-family: "Lato", sans-serif;
        font-size: 1.25em;
        border-left: 1px solid rgb(255, 255, 255, 0.5);
        padding: 1rem;
    }
    @media only screen and (min-width: 720px) {
        .about-container {
            width: 60%;
        }
        .container {
            display: flex;
        }
    }
</style>

<div class="about">
    <div class="container">
        <h1 class="corner-name">Ross MacDonald</h1>
        <div class="sub-header">
            <h2 class="corner-sub">Full Stack Web Developer</h2>
        </div>
    </div>
    <div class="about-container">
        <h1 class="header">About Me</h1>
        <p>
            <br />
            <br />

            <br />
            <br />
            <span id="corona">
                **Before Corona. I now enjoy spending lots and lots of time at
                home with my wife Nicole and our cat Holly.
            </span>
        </p>
    </div>
</div>

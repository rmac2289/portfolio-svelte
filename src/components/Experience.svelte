<script>
    import Layout from "./Layout.svelte";
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
        As a developer I feel most at home writing full-stack web apps with
        JavaScript. Though true, that's a wild oversimplification; I've worked
        with countless frameworks, libraries and tools while digging deep into
        problems to find the most efficient solutions possible. I regularly work
        with React, Node.js, SQL and NoSQL Databases (mainly Postgres &
        MongoDB), REST & GraphQL APIs, and of course HTML & CSS.
        <br />
        <br />
        By no means is that an exhaustive list, but it is the technology with
        which I have written the most production code. I've recently branched
        out on the front-end - I picked up Vue fairly quickly and started
        working with Svelte (which is what I rebuilt this site with!), as well
        as the back-end - I've been refactoring my "Find Your Park" app from a
        REST to a GraphQL API. In addition to the web, I've published a mobile
        version of one of my apps to Apple's app store using React Native, and I
        have another in production. Yes, I'm absolutely tooting my own horn
        here, but that is literally what this site is for.
        <br />
        <br />
        I genuinely love to program - creating something from nothing is just
        awesome. On the other hand, digging deep into somebody elses code to
        figure out how it works or to troubleshoot a problem is equally
        rewarding. I find the process of learning new technologies both exciting
        and humbling - the software development field has a way of telling you
        how little you truly know and how much more knowledge there will always
        be to gain.
        <br />
        <br />
        Professionally, I have a ton of experience dealing with high-stress
        situations. I'm always calm under pressure and am often the voice of
        reason when things go haywire. I communicate directly - in my experience
        ambiguity is an efficiency killer. I'm someone you want on your team.
        Feel free to send me an email or reach out on LinkedIn if I sound like a
        good match for your team.
    </p>
    <h1 class="header">Tech</h1>
    <div class="tech-grid">
        <div class="icon-box">
            <i class="fab fa-react" />
            <p>React</p>
        </div>
        <div class="icon-box">
            <i class="fab fa-node-js" />
            <p>Node.js</p>
        </div>
        <div class="icon-box">
            <i class="fab fa-js" />
            <p>JavaScript</p>
        </div>
        <div class="icon-box">
            <i class="fab fa-html5" />
            <p>HTML5</p>
        </div>
        <div class="icon-box">
            <i class="fab fa-vuejs" />
            <p>Vue</p>
        </div>
        <div class="icon-box">
            <i class="fab fa-css3" />
            <p>CSS3</p>
        </div>
        <div class="icon-box">
            <i class="fab fa-git-alt" />
            <p>git</p>
        </div>
        <div class="icon-box">
            <i class="fab fa-github" />
            <p>GitHub</p>
        </div>
        <div class="icon-box">
            <i class="fas fa-terminal" />
            <p>bash</p>
        </div>
        <div class="icon-box">
            <i class="fab fa-npm" />
            <p>npm</p>
        </div>
        <div class="icon-box">
            <i class="fab fa-yarn" />
            <p>yarn</p>
        </div>
        <div class="icon-box">
            <i class="fab fa-python" />
            <p>Python</p>
        </div>
    </div>
</Layout>

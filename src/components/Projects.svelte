<script>
    import Layout from "./Layout.svelte";
    let meal = "images/meal.png";
    let fyp = "images/fyp.png";
    let fypmobile = "images/fypmobilemap.jpg";
    let hearsay = "images/hearsay.png";
    let safety = "images/safety.PNG";
    import { Router, Route } from "svelte-routing";
    console.dir(Router);
</script>

<style>
    .header {
        color: white;
    }
    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
    }
</style>

<svelte:head>
    <title>Projects</title>
</svelte:head>
<Layout>
    <h1 class="header">Projects</h1>
    <div class="grid">
        <div id="meal">
            <img width="400" height="450" src={meal} alt="meal" />
        </div>
        <div id="fyp"><img width="500" height="325" src={fyp} alt="fyp" /></div>
        <div id="hearsay">
            <img width="500" height="325" src={hearsay} alt="hearsay" />
        </div>
        <div id="fypmobile">
            <img width="175" height="325" src={fypmobile} alt="fypmobile" />
        </div>

        <div id="safety">
            <img width="175" height="325" src={safety} alt="safety" />
        </div>
    </div>
</Layout>

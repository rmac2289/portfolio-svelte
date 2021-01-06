<script>
    import Layout from "./Layout.svelte";
    let meal = "images/meal.png";
    let fyp = "images/fyp.png";
    let fypmobile = "images/fypmobilemap.jpg";
    let hearsay = "images/hearsay.png";
    let safety = "images/safety.PNG";
    import Carousel from "./Carousel.svelte";
    let safetyImages = [
        "images/safetyhome.PNG",
        "images/safetyadd.PNG",
        "images/safetyadded.PNG",
        "images/safetystate.PNG",
        "images/safetylist.PNG",
        "images/safetycall.PNG",
        "images/safetyhomebottom.PNG",
    ];
    import { Image } from "@cloudinary/svelte";
    import { cloud_name } from "../../config";
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
    <Carousel images={safetyImages} />
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

<!-- <div id="meal">
    <Image
        width="400"
        height="450"
        cloud_name="de36vblcl"
        public_id="meal"
        alt="meal" />
</div>
<div id="fyp">
    <Image
        width="500"
        height="325"
        cloud_name="de36vblcl"
        public_id="fyphome"
        alt="fyp" />
</div>
<div id="hearsay">
    <Image
        width="500"
        height="325"
        cloud_name="de36vblcl"
        public_id="hearsayhome"
        alt="hearsay" />
</div>
<div id="fypmobile">
    <Image
        width="175"
        height="325"
        cloud_name="de36vblcl"
        public_id="fypmobile"
        alt="fypmobile" />
</div>

<div id="safety">
    <Image
        cloud_name="de36vblcl"
        width="175"
        height="325"
        public_id="safetyhome"
        alt="safety" />
</div> -->

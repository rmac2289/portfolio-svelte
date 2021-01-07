<script>
    import Layout from "./utils/Layout.svelte";
    import SafetyBlanket from "./projects/SafetyBlanket.svelte";
    import Hearsay from "./projects/Hearsay.svelte";
    import FypMobile from "./projects/FypMobile.svelte";
    import Fyp from "./projects/Fyp.svelte";
    import MealGenerator from "./projects/MealGenerator.svelte";
    import { Image } from "@cloudinary/svelte";
    import { cloud_name } from "../../config";
</script>

<style>
    .header {
        color: white;
    }
    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 50px;
    }
</style>

<svelte:head>
    <title>Projects</title>
</svelte:head>
<Layout>
    <h1 class="header">Projects</h1>
    <div class="grid">
        <MealGenerator />
        <Fyp />
        <FypMobile />
        <Hearsay />
        <SafetyBlanket />
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

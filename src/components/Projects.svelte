<script>
    import Layout from "./Layout.svelte";
    import Project from "./Project.svelte";
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

    <Project />
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

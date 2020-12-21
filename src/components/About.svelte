<script>
    import { store } from "../store";
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
        border-left: 1px solid rgb(255, 255, 255, 0.5);
        padding: 1rem;
    }
</style>

<Layout>
    <h1 class="header">About Me</h1>
    <p>{$store.about1} <br /> <br /> {$store.about2}</p>
</Layout>

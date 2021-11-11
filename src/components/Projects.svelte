<script>
  import Layout from "./utils/Layout.svelte";
  import SafetyBlanket from "./projects/SafetyBlanket.svelte";
  import Hearsay from "./projects/Hearsay.svelte";
  import FypMobile from "./projects/FypMobile.svelte";
  import Fyp from "./projects/Fyp.svelte";
  import Portfolio from "./projects/Portfolio.svelte";
  import MealGenerator from "./projects/MealGenerator.svelte";
  import { fly } from "svelte/transition";
  import OTmobile from "./projects/OTmobile.svelte";
  import UxDashboard from './projects/UxDashboard.svelte'
</script>

<svelte:head>
  <title>Projects</title>
</svelte:head>
<Layout>
  <div class="grid" transition:fly={{ duration: 1000, y: 500 }}>
    <UxDashboard/>
    <OTmobile />
    <SafetyBlanket />
    <Fyp />
    <Hearsay />
    <Portfolio />
    <FypMobile />
    <MealGenerator />
  </div>
</Layout>

<style>
  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
    width: 95%;
    padding: 10px;
    margin-left: auto;
    margin-right: auto;
  }
</style>

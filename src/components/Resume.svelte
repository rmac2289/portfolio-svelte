<script>
  import Layout from "./utils/Layout.svelte";
</script>

<svelte:head>
  <title>Resume</title>
</svelte:head>
<Layout>
  <div class="container">
    <iframe class="iframe" src="images/resume.pdf" title="resume" />
  </div>
</Layout>

<style>
  .container {
    width: 100%;
    height: 100%;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
  }
  .iframe {
    width: 350px;
    height: 520px;
    opacity: 0.85;
    margin-left: auto;
    margin-right: auto;
  }
  @media only screen and (min-width: 720px) {
    .iframe {
      min-height: 1000px;
      min-width: 800px;
    }
  }
</style>

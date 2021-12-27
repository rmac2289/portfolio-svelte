<script>
  (function () {
    emailjs.init("user_uXigZw2RYzgOCTjVxakmu");
  })();
  import { alert } from "../alert";
  import Layout from "./utils/Layout.svelte";
  import emailjs from "emailjs-com";
  let email = "";
  let name = "";
  let message = "";
  import Toast from "./utils/Toast.svelte";
  import { onMount } from "svelte";
  import { darkmode } from "../store";
  console.log(document.body);
  //   onMount(() => {
  //     if ($darkmode) {
  //       document.body
  //     }
  //   });
  function handleSubmit() {
    if (!email) {
      alert.set({ isActive: true, text: "Email is required." });
      return;
    }
    if (!name) {
      alert.set({ isActive: true, text: "Name is required." });
      return;
    }
    if (!message) {
      alert.set({ isActive: true, text: "Message is required." });
      return;
    }
    let params = {
      reply_to: email,
      from_name: name,
      message_html: message,
    };
    emailjs
      .send("gmail", "template_DMlIudKC", params, "user_uXigZw2RYzgOCTjVxakmu")
      .then(() => {
        alert.set({
          isActive: true,
          text: "Thanks for reaching out! I'll get back to you shortly.",
        });
      })
      .catch(() => {
        alert.set({
          isActive: true,
          text: "Sorry, looks like something went wrong.",
        });
      });
  }
</script>

<svelte:head>
  <title>Contact Me</title>
</svelte:head>
<Layout>
  <h1 class="header">Get in touch</h1>

  <div class="content">
    <form>
      <label for="email">email</label>
      <input bind:value={email} type="email" id="email" required={true} />
      <label for="name">name</label>
      <input bind:value={name} type="text" id="name" required={true} />
      <label for="message">message</label>
      <textarea
        bind:value={message}
        type="textarea"
        id="message"
        required={true}
      />
      <div class="icons">
        <a
          href="https://www.linkedin.com/in/rsmacdonald/"
          target="_blank"
          rel="noopener noreferrer"><i class="fab fa-linkedin-in" /></a
        >
        <a
          href="https://github.com/rmac2289"
          target="_blank"
          rel="noopener noreferrer"><i class="fab fa-github" />
        </a>
      </div>
      <button on:click|preventDefault={handleSubmit}>send</button>
    </form>
    <Toast />
  </div>
</Layout>

<style>
  .header {
    color: white;
    width: 100%;
    padding-left: 1rem;
    margin-left: auto;
    margin-right: auto;
    max-width: 650px;
  }
  .content {
    border-left: 1px solid rgb(255, 255, 255, 0.5);
    padding: 1rem;
    margin-left: auto;
    margin-right: auto;
    max-width: 650px;
    margin-bottom: 0;
  }
  form {
    color: white;
    font-size: 1.5em;
  }
  label {
    border-bottom: 1px solid rgb(255, 255, 255, 0.5);
    display: flex;
    align-items: flex-end;
    margin-bottom: 50px;
  }
  form {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 10px;
  }
  input,
  textarea {
    grid-column: 2 / 5;
    font-size: 1em;
    background: rgb(255, 255, 255, 0.3);
    border: none;
    color: white;
    box-shadow: var(--main-shadow);
  }
  input:focus,
  textarea:focus {
    border: none;
    outline: none;
  }
  button {
    grid-row: 5/6;
    grid-column: 4/5;
    background: rgb(255, 255, 255, 0.3);
    border: none;
    color: white;
    transition: 0.5s all linear;
    cursor: pointer;
    min-width: 100px;
    box-shadow: var(--main-shadow);
  }
  button:hover {
    background: rgb(255, 255, 255, 0.7);
    box-shadow: 0 0 200px rgb(0, 0, 0, 0.5);
    color: rgba(6, 15, 6);
  }
  button:active {
    transform: scale(0.9);
  }
  i {
    color: rgb(255, 255, 255, 0.7);
    font-size: 24px;
    transition: 0.5s all linear;
  }
  .icons {
    width: 60px;
    grid-row: 5;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  i:hover {
    color: white;
  }
</style>

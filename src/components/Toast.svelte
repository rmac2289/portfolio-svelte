<script>
    import { slide } from "svelte/transition";
    import { alert } from "../alert";
    function closeAlert() {
        alert.set({
            text: $alert.text,
            isActive: false,
        });
    }
    alert.subscribe((value) => {
        if (value.isActive) {
            setTimeout(closeAlert, 3000);
        }
    });
</script>

<style>
    .toast {
        color: white;
        background: rgb(16, 39, 16);
        padding: 20px;
        position: fixed;
        bottom: 10px;
        left: 10px;
        right: 10px;
        border-radius: 5px;
    }
    .toast p {
        text-align: center;
        margin: 0;
        max-width: 100%;
        font-size: 1.15em;
    }
    #red {
        background: rgb(104, 1, 1);
    }
</style>

{#if $alert.isActive}
    <div
        on:click={closeAlert}
        transition:slide={{ y: 100 }}
        class="toast"
        id={$alert.text.includes('required') && 'red'}>
        <p>{$alert.text}</p>
    </div>
{/if}

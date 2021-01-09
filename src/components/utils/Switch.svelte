<script>
    export let checked = false;
</script>

<style>
    .switch {
        position: fixed;
        bottom: 10px;
        left: 50%;
        margin-left: -30px;
        display: inline-block;
        width: 60px;
        height: 34px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-left: 1px solid rgba(255, 255, 255, 0.4);
        border-right: 1px solid rgba(255, 255, 255, 0.4);

        transition: 0.4s;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 4px;
        bottom: 50%;
        margin-bottom: -10px;
        background-color: rgb(6, 16, 6);
        border: 1px solid rgba(255, 255, 255, 0.4);
        transition: 0.4s;
    }

    input:checked + .slider {
        background-color: rgba(255, 255, 255, 0.3);
        border: none;
    }

    input:checked + .slider:before {
        transform: translateX(32px);
    }
</style>

<label class="switch">
    <input type="checkbox" bind:checked />
    <span class="slider" />
</label>

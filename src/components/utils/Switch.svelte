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
        background-color: rgba(255, 255, 255, 0.4);
        -webkit-transition: 0.4s;
        transition: 0.4s;
        border-radius: 24px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: rgb(6, 16, 6);
        border-radius: 50%;
        -webkit-transition: 0.4s;
        transition: 0.4s;
    }

    input:checked + .slider {
        background-color: rgba(255, 255, 255, 0.4);
    }

    input:checked + .slider:before {
        transform: translateX(26px);
    }
</style>

<label class="switch">
    <input type="checkbox" bind:checked />
    <span class="slider" />
</label>

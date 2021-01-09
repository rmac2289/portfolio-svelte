<script>
    export let checked = false;
</script>

<style>
    .switch {
        position: fixed;
        bottom: 10px;
        left: 50%;
        margin-left: -37px;
        display: inline-block;
        width: 74px;
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
        transition: 0.4s;
        border-bottom: 1px solid rgb(255, 255, 255, 0.2);
        border-top: 1px solid rgb(255, 255, 255, 0.2);
    }

    .slider:before {
        position: absolute;
        content: "";
        width: 18px;
        height: 18px;
        border-radius: 20%;
        left: 12px;
        top: 5px;
        bottom: 4px;
        background-color: rgba(255, 255, 255, 0.6);
        transition: 0.4s;
    }
    .fa-moon,
    .fa-sun {
        position: absolute;
        bottom: 0;
        font-size: 16px;
        transition: 0.4s all linear;
        cursor: pointer;
    }
    .fa-moon {
        right: -10px;
        top: 8px;
        color: rgb(255, 255, 255, 0.4);
    }
    .fa-sun {
        left: -10px;
        top: 8px;
        color: rgb(255, 255, 255, 0.8);
    }
    input:checked + .slider + .fa-sun + .fa-moon {
        color: rgb(255, 255, 255, 0.8);
    }
    input:checked + .slider + .fa-sun {
        color: rgb(255, 255, 255, 0.4);
    }

    input:checked + .slider:before {
        transform: translateX(36px);
    }
</style>

<label class="switch">
    <input type="checkbox" bind:checked />
    <span class="slider" />
    <i class="fas fa-sun" />
    <i class="fas fa-moon" />
</label>

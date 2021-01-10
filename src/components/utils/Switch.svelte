<script>
    export let checked = false;
</script>

<style>
    .switch {
        display: inline-block;
        width: 74px;
        height: 34px;
        position: relative;
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
    }
    #arrow {
        color: rgb(255, 255, 255, 0.8);
        transition: 0.4s;
        font-size: 18px;
    }
    .icon-box-left,
    .icon-box-right {
        position: absolute;
        bottom: 0;
        top: 0;
        transition: 0.4s all linear;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .icon-box-left {
        left: -10px;
    }
    .icon-box-right {
        right: -10px;
    }
    .fa-moon {
        font-size: 18px;
        color: rgb(255, 255, 255, 0.4);
    }
    .fa-sun {
        color: rgb(255, 255, 255, 0.8);
        font-size: 18px;
    }
    .arrow-box {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        content: "";
        left: 12px;
        top: 0;
        bottom: 0;
        transition: 0.4s;
    }
    input:checked + .slider + .icon-box-left + .icon-box-right .fa-moon {
        color: rgb(255, 255, 255, 0.8);
    }
    input:checked + .slider + .icon-box-left .fa-sun {
        color: rgb(255, 255, 255, 0.4);
    }

    input:checked + .slider #arrow {
        transform: translateX(42px) rotate(540deg);
    }
</style>

<label class="switch">
    <input type="checkbox" bind:checked />
    <div class="slider">
        <div class="arrow-box"><i class="fas fa-caret-left" id="arrow" /></div>
    </div>
    <div class="icon-box-left"><i class="fas fa-sun" /></div>
    <div class="icon-box-right"><i class="fas fa-moon" /></div>
</label>

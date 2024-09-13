<script lang="ts">
    import { FSM } from "$lib/fsm.svelte.js";
    import { onMount } from "svelte";

    const carFSM = new FSM({
        speed: 0,
        position: 0,
        distance: 0,
        interval: null as number | null,
        test: 'foo'
    },
        {
            idle: {
                enter: (context) => {
                    context.speed = 0;
                    context.position = 0;
                },
                on: {
                    accelerate: (context) => {
                        context.speed += 1;
                        return "moving" as const;
                    }
                }
            },
            moving: {
                enter: (context) => {
                    context.interval = setInterval(() => {
                        context.distance += context.speed;
                    }, 100);
                },
                on: {
                    accelerate: (context) => {
                        if(context.speed < 5) {
                            context.speed += 1;
                        }
                        return "moving" as const;
                    },
                    decelerate: (context) => {
                        context.speed -= 1;
                        if(context.speed <= 0) {
                            context.speed = 0;
                            return "idle";
                        }
                        return "moving";
                    },
                    moveLeft: (context) => {
                        context.position -= 1;
                        if(context.position < -4) {
                            return "crashed";
                        }
                        return "moving";
                    },
                    moveRight: (context) => {
                        context.position += 1;
                        if(context.position > 1) {
                            return "crashed";
                        }
                        return "moving";
                    },
                },
            },
            crashed: {
                enter: (context) => {
                    clearInterval(context.interval!);
                    context.distance = 0;
                },
                on: {
                    reset: "idle",
                }
            }
        } as const,
        "idle",
    );

    onMount(async () => {
        await carFSM.start();
    });

</script>

<svelte:window onkeydown="{(e) => {
    if(e.key === "ArrowUp") {
        carFSM.send("accelerate");
    } else if(e.key === "ArrowDown") {
        carFSM.send("decelerate");
    } else if(e.key === "ArrowLeft") {
        carFSM.send("moveLeft");
    } else if(e.key === "ArrowRight") {
        carFSM.send("moveRight");
    }
}}"></svelte:window>

<h1>svelte5-fsm example</h1>

<p>Use arrow keys (up, down, left, right) to control the car.</p>

<div
    id="wroom"
    style="--position: {carFSM.context.position}; --speed: {carFSM.context.speed};"
    class:moving={carFSM.state === "moving"}
>
    <div id="grass">
        <div id="road">
            <div class="lines">
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
            </div>
        </div>
    </div>
    <img
        alt="car"
        src={carFSM.state === 'crashed' ? "/explosion.gif" : "/spr_casualcar_0_0.png"}
        id="car"
    />
</div>

State: {carFSM.state}

{#if carFSM.state === "crashed"}
    <button onclick={() => carFSM.send("reset")}>Reset</button>
{/if}

— Speed: {carFSM.context.speed} — Position: {carFSM.context.position} — Distance: {carFSM.context.distance}


<style>
    #wroom {
        position: relative;
        width: 100%;
        height: 200px;
        background-color: #f0f0f0;
        --time: calc(0.3s - (var(--speed) / 10 * 0.3s));
    }

    #car {
        position: absolute;
        top: calc(10% * var(--position));
        left: calc(0% + calc(var(--speed) * 10%));
        transform: rotateY(180deg);
        transition: all 0.2s;
    }

    #wroom.moving #car {
        animation: shake var(--time) infinite;
    }
    #wroom.moving .lines {
        animation: move var(--time) infinite reverse linear;
    }

    #grass {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: #0f0;
    }

    #road {
        position: absolute;
        top: calc(50% - 50px);
        width: 100%;
        height: 100px;
        overflow: clip;
        background-color: #111;
    }

    .lines {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: space-between;
        overflow: clip;
        align-items: center;
    }

    .line {
        width: 100px;
        height: 10px;
        background-color: #fff;
    }

    @keyframes shake {
        0% {
            transform: rotateY(180deg) translateX(calc(-1px * var(--speed))) translateY(calc(-1px * var(--speed)));
        }
        50% {
            transform: rotateY(180deg) translateX(calc(1px * var(--speed))) translateY(calc(1px * var(--speed)));
        }
        100% {
            transform: rotateY(180deg) translateX(calc(-1px * var(--speed))) translateY(calc(-1px * var(--speed)));
        }
    }

    @keyframes move {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(17.5vw);
        }
    }
</style>
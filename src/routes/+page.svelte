<script lang="ts">
    import { FSM } from '$lib/fsm.svelte.js';

    const machine = new FSM({
        context: { count: 0 },
        initial: 'idle',
        debug: true,
        states: {
            idle: {
                guard: (context) => context.count< 5 ? true : 'full',
                on: {
                    INCREMENT: 'incrementing',
                    DECREMENT: 'decrementing',
                    RESET: (context) => {
                        context.count = 0;
                        return 'idle';
                    }
                }
            },
            incrementing: {
                guard: (context) => context.count< 5,
                enter: (context) => { return { ...context, count: context.count + 1 }},
                goto: 'idle'
            },
            full: {
                on: {
                    DECREMENT: 'decrementing',
                    RESET: (context) => {
                        context.count = 0;
                        return 'idle';
                    }
                }
            },
            decrementing: {
                guard: (context) => context.count > 0,
                enter: (context) => { return { ...context, count: context.count - 1 }},
                goto: 'idle'
            }
        } as const // This is required to make the state machine type safe
    });

    machine.start();

    let text = `<script lang="ts">
    import { FSM } from 'svelte5-fsm';

    const machine = new FSM({
        context: { count: 0 },
        initial: 'idle',
        debug: true,
        states: {
            idle: {
                guard: (context) => context.count< 5 ? true : 'full',
                on: {
                    INCREMENT: 'incrementing',
                    DECREMENT: 'decrementing',
                    RESET: (context) => {
                        context.count = 0;
                        return 'idle';
                    }
                }
            },
            incrementing: {
                guard: (context) => context.count< 5,
                enter: (context) => { return { ...context, count: context.count + 1 }},
                goto: 'idle'
            },
            full: {
                on: {
                    DECREMENT: 'decrementing',
                    RESET: (context) => {
                        context.count = 0;
                        return 'idle';
                    }
                }
            },
            decrementing: {
                guard: (context) => context.count > 0,
                enter: (context) => { return { ...context, count: context.count - 1 }},
                goto: 'idle'
            }
        } as const // This is required to make the state machine type safe
    });

    machine.start();
<\/script>

<button onclick={() => machine.send('INCREMENT')} class:disabled={machine.currentState === 'full'}>Increment</button>
<button onclick={() => machine.send('DECREMENT')} class:disabled={machine.context.count === 0}>Decrement</button>
<button onclick={() => machine.send('RESET')}>Reset</button>
<p>
    Current state: {machine.currentState}<br>
    Count: {machine.context.count}
</p>
`;

</script>

<h1>svelte5-fsm</h1>

<p>A tiny (0.8kB) but surprisingly flexible finite state machine that uses Svelte 5's `$state` rune for reactivity.</p>

<h2 id="installation">Installation</h2>

<code>
npm install svelte5-fsm
</code>

<p>Alternatively, just copy the `fsm.svelte.ts` file to your project.</p>

<p><b>Svelte 5 is required. This library is not compatible with older versions.</b></p>

<h2 id="usage">Usage</h2>

<code>
{text}
</code>

<h2 id="example">Example</h2>

<button onclick={() => machine.send('INCREMENT')} class:disabled={machine.currentState === 'full'}>Increment</button>
<button onclick={() => machine.send('DECREMENT')} class:disabled={machine.context.count === 0}>Decrement</button>
<button onclick={() => machine.send('RESET')}>Reset</button>
<p>
    Current state: {machine.currentState}<br>
    Count: {machine.context.count}
</p>


<h2 id="api">API</h2>
<h3 id="-fsm-"><code>FSM</code></h3>
<h4 id="-new-fsm-config-config-"><code>new FSM(config: Config)</code></h4>
<p>Creates a new finite state machine.</p>
<ul>
<li><code>config</code> - The configuration object for the state machine.<ul>
<li><code>context</code> - The context object that will be passed to each state.</li>
<li><code>initial</code> - The initial state of the machine.</li>
<li><code>debug</code> - Whether to log state transitions to the console.</li>
<li><code>states</code> - The state configuration object.<ul>
<li><code>on</code> - The event handlers for the state.</li>
<li><code>guard</code> - The guard function that determines if the state can be entered.</li>
<li><code>enter</code> - The function that is called when the state is entered.</li>
<li><code>goto</code> - State to transition to immediately after entering.</li>
</ul>
</li>
</ul>
</li>
</ul>
<h4 id="-machine-send-event-string-data-any-"><code>machine.send(event: string, data?: any, context?: Context)</code></h4>
<p>
    Sends an event to the state machine, which will trigger a state transition. Additional data can be passed to the event handler. Changes to the context object can be made by passing a context object.
</p>
<ul>
<li><code>event</code> - The event to send.</li>
<li><code>data</code> - The data to pass to the event handler.</li>
<li><code>context</code> - The context object to pass to the state.</li>
</ul>
<h4 id="-machine-start-context-context-"><code>machine.start(context?: Context)</code></h4>
<p>Starts the state machine with the optional context object.</p>
<h4 id="-machine-currentstate-"><code>machine.currentState</code></h4>
<p>The current state of the machine.</p>
<h4 id="-machine-context-"><code>machine.context</code></h4>
<p>The context object of the machine.</p>
<h2 id="license">License</h2>
<p>MIT</p>

<style>
    :global(html) {
        font-family: sans-serif;
    }
    :global(body) {
        margin: 2rem;
        padding: 0;
    }
    code {
        white-space: pre-wrap;
        font-family: monospace;
    }
    button.disabled {
        opacity: 0.5;
        pointer-events: none;
    }
</style>
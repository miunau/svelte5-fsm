# svelte5-fsm

<p>
  <a href="https://github.com/miunau/svelte5-fsm/actions"><img src="https://img.shields.io/github/actions/workflow/status/miunau/svelte5-fsm/ci.yml?logo=github" alt="build"></a>
  <a href="https://www.npmjs.com/package/svelte5-fsm"><img src="https://img.shields.io/npm/v/svelte5-fsm" alt="npm"></a>
  <a href="https://www.npmjs.com/package/svelte5-fsm"><img src="https://img.shields.io/npm/types/svelte5-fsm" alt="npm type definitions"></a>
</p>

A tiny (0.8kB) but surprisingly flexible finite state machine that uses Svelte 5's `$state` rune for reactivity.

## Installation

```bash
npm install svelte5-fsm
```

Alternatively, just copy the `fsm.svelte.ts` file to your project.

<b>Svelte 5 is required. This library is not compatible with older versions.</b>

## Usage

```svelte
<script lang="ts">
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
</script>

<button onclick={() => machine.send('INCREMENT')} class:disabled={machine.state === 'full'}>Increment</button>
<button onclick={() => machine.send('DECREMENT')} class:disabled={machine.context.count === 0}>Decrement</button>
<button onclick={() => machine.send('RESET')}>Reset</button>
<p>
    Current state: {machine.state}<br>
    Count: {machine.context.count}
</p>
```

## API

### `FSM`

#### `new FSM(config: Config)`
Creates a new finite state machine.

- `config` - The configuration object for the state machine.
  - `context` - The context object that will be passed to each state. If you want type safety on the object, it's recommended to construct it beforehand and pass it as a parameter.
  - `states` - The state configuration object.
    - `on` - The event handlers for the state. Can be a string representing the next state, or a function that returns the next state. The context is passed as a parameter to the function.
    - `guard` - The guard function that determines if the state can be entered. Can return a boolean or a string. If it returns a string, the state machine will transition to that state instead. The context is passed as a parameter to the function.
    - `enter` - The function that is called when the state is entered. The context is passed as a parameter to the function.
    - `goto` - State to transition to immediately after entering. Run after `guard` and `enter`.
  - `initial` - The initial state of the machine. Must be a key of the `states` object.
  - `debug` - Whether to log state transitions to the console.

Look at the code for exact type signatures if you need them.

#### `machine.send(event: string, data?: any, context?: Context)`
Sends an event to the state machine, which will trigger a state transition. Additional data can be passed to the event handler. Changes to the context object can be made by passing a context object or by doing them inside the event handler.

- `event` - The event to send.
- `data` - The data to pass to the event handler.
- `context` - The context object to pass to the state.

#### `machine.start(context?: Context)`
Starts the state machine from the initial state with the optional context object.

#### `machine.state`
The current state of the machine (declared as a `$state`).

#### `machine.context`
The context object of the machine (declared as a `$state`).

## License

MIT

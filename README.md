# svelte5-fsm

<p>
  <a href="https://github.com/svelte5-fsm/actions"><img src="https://img.shields.io/github/actions/workflow/status/svelte5-fsm/ci.yml?logo=github" alt="build"></a>
  <a href="https://www.npmjs.com/package/svelte5-fsm"><img src="https://img.shields.io/npm/v/svelte5-fsm" alt="npm"></a>
  <a href="https://www.npmjs.com/package/svelte5-fsm"><img src="https://img.shields.io/npm/types/svelte5-fsm" alt="npm type definitions"></a>
</p>

A tiny finite state machine that uses Svelte 5's `$state` rune for reactive state management.

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
                guard: (context) => context.count < 10 ? true : 'full',
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
                guard: (context) => context.count < 10,
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

<button onclick={() => machine.send('INCREMENT')} class:disabled={machine.currentState === 'full'}>Increment</button>
<button onclick={() => machine.send('DECREMENT')} class:disabled={machine.context.count === 0}>Decrement</button>
<button onclick={() => machine.send('RESET')}>Reset</button>
<p>
    Current state: {machine.currentState}<br>
    Count: {machine.context.count}
</p>
```

## API

### `FSM`

#### `new FSM(config: Config)`
Creates a new finite state machine.

- `config` - The configuration object for the state machine.
  - `context` - The context object that will be passed to each state.
  - `initial` - The initial state of the machine.
  - `debug` - Whether to log state transitions to the console.
  - `states` - The state configuration object.
    - `on` - The event handlers for the state.
    - `guard` - The guard function that determines if the state can be entered.
    - `enter` - The function that is called when the state is entered.
    - `goto` - State to transition to immediately after entering.

Look at the code for exact type signatures if you need them.

#### `machine.send(event: string, data?: any)`
Sends an event to the state machine.

- `event` - The event to send.
- `context` - The context object to pass to the state.

#### `machine.start(context?: Context)`
Starts the state machine with the optional context object.

#### `machine.currentState`
The current state of the machine.

#### `machine.context`
The context object of the machine.

## License

MIT
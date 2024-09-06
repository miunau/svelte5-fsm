/**
 * Finite State Machine for Svelte 5.
 * Version: 1.0.1
 * Author: miunau <miunau+npm@miunau.com>
 * License: MIT
 */

export type FSMContext<ContextType> = {
    [key in keyof ContextType]: ContextType[key];
};

export type FSMState<ContextType, StateKeyType> = {
    on?: Record<string, (StateKeyType | ((context: FSMContext<ContextType>, data?: any) => StateKeyType))>;
    guard?: (context: FSMContext<ContextType>) => Promise<void | boolean | StateKeyType> | void | boolean | StateKeyType;
    enter?: (context: FSMContext<ContextType>) => Promise<FSMContext<ContextType> | void> | FSMContext<ContextType> | void;
    goto?: StateKeyType;
};

export class FSM<
    ContextType extends Record<string, any>,
    StateType extends Record<string, FSMState<ContextType, keyof StateType>>
> {
    public initialState: keyof StateType;
    public currentState: keyof StateType = $state('');
    public states: StateType;
    public context: ContextType = $state({} as ContextType);
    private debug: boolean = true;

    /**
     * Create a new finite state machine.
     * @param {Object} opts - Options object.
     * @param {Record<string, any>} opts.context - Initial context.
     * @param {Record<string, FSMState<ContextType, keyof StateType>>} opts.states - State machine states.
     * @param {string} opts.initial - Initial state.
     * @param {boolean} opts.debug - Debug mode. Logs internal state changes and function calls.
     * @returns {FSM} - Finite state machine.
     */
    constructor(config: { context: ContextType; states: StateType; initial: keyof StateType; debug?: boolean; }) {
        this.context = config.context;
        this.states = config.states;
        this.initialState = config.initial;
        this.debug = config.debug || false;
        this.log('Created with config:', config);
    }

    private log(...message: any[]): void {
        if (this.debug) console.log('[FSM]', ...message, 'Current:', this.currentState, this.context);
    }

    /**
     * Start the finite state machine.
     * @param {Partial<ContextType>} context - Context to start with.
     * @returns {Promise<void>} - Promise that resolves when the FSM has started.
     */
    async start(context?: Partial<ContextType>): Promise<void> {
        this.context = { ...this.context, ...context };
        this.currentState = this.initialState;
        this.log('START:', this.initialState);
        await this.enter();
    }

    /**
     * Send an event to the finite state machine.
     * @param {string} event - Event to send.
     * @param {any} data - Data to send with the event to the handler.
     * @param {Partial<ContextType>} context - Context to send with the event.
     * @returns {Promise<void>} - Promise that resolves when the event has been sent.
     */
    async send(event: string, data?: any, context?: Partial<ContextType>): Promise<void> {
        this.log('SEND:', event, 'with data:', data);
        const state = this.states[this.currentState];
        if (state.on && state.on[event]) {
            const newState = typeof state.on[event] === 'function' ? state.on[event](this.context, data) : state.on[event];
            await this.transition(newState, context);
        } else {
            console.error(`Event ${event} not found in state ${String(this.currentState)}`);
        }
    }

    private async transition(newState: keyof StateType, context: Partial<ContextType> = {}): Promise<void> {
        this.context = { ...this.context, ...context };
        this.log(`TRANSITION: "${String(this.currentState)}" to "${String(newState)}"`);
        // run guard if it exists
        if (this.states[newState].guard) {
            this.log('GUARD:', newState);
            const nextState = await this.states[newState].guard!(this.context);
            if (nextState === true) {
                this.currentState = newState;
            }
            else if(nextState === false || nextState === undefined) {
                this.log(`Guard failed for state "${String(newState)}". Staying in "${String(this.currentState)}".`);
            }
            else if(typeof nextState === 'string') {
                if(!this.states[nextState]) {
                    throw new Error(`State "${nextState}" returned from guard in "${String(newState)}" does not exist.`);
                }
                this.log(`Transitioning to "${String(nextState)}" from guard in ${String(this.currentState)}.`);
                return this.transition(nextState);
            }
        } else {
            this.currentState = newState;
        }
        await this.enter();
        if(this.states[this.currentState].goto) {
            await this.goto(this.states[this.currentState].goto!);
        }
    }

    private async goto(newState: keyof StateType): Promise<void> {
        // don't allow loops
        if (this.currentState === newState) {
            throw new Error(`Goto loop detected in state ${String(this.currentState)} to ${String(newState)}`);
        }
        this.log('GOTO:', newState);
        this.currentState = newState;
        await this.transition(newState);
    }

    private async enter(): Promise<void> {
        if (this.states[this.currentState].enter) {
            this.log('ENTER:', this.currentState);
            try {
                const ret = await Promise.resolve(
                    this.states[this.currentState].enter!(this.context)
                );
                this.log('ENTERED:', this.currentState, ret);
                if (ret) {
                    this.context = ret;
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
}

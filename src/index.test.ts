import { describe, it, expect } from 'vitest';
import { FSM } from  './lib/index.js';

describe('FSM test', () => {
	it('creates a new FSM', () => {
		const fsm = new FSM(
			{ count: 0 },
			{
				idle: {
					on: {
						CLICK: 'loading'
					}
				},
				loading: {
					on: {
						LOADED: 'idle'
					}
				}
			} as const,
			'idle',
		);
		expect(fsm).toBeDefined();
		expect(fsm.context).toEqual({ count: 0 });
	});
	
	it('starts the FSM', () => {
		const fsm = new FSM(
			{ count: 0 },
			{
				idle: {
					on: {
						CLICK: 'loading'
					}
				},
				loading: {
					on: {
						LOADED: 'idle'
					}
				}
			} as const,
			'idle',
		);
		fsm.start();
		expect(fsm.state).toBe('idle');
	});

	it('sends an event', async () => {
		const fsm = new FSM(
			{ count: 0 },
			{
				idle: {
					on: {
						CLICK: 'loading'
					}
				},
				loading: {
					on: {
						LOADED: 'idle'
					}
				}
			} as const,
			'idle',
		);
		fsm.start();
		await fsm.send('CLICK');
		expect(fsm.state).toBe('loading');
	});

	it('sends an event with context', async () => {
		const fsm = new FSM(
			{ count: 0 },
			{
				idle: {
					on: {
						CLICK: 'loading'
					}
				},
				loading: {
					on: {
						LOADED: 'idle'
					}
				}
			} as const,
			'idle',
		);
		fsm.start();
		await fsm.send('CLICK', null, { count: 1 });
		expect(fsm.context).toEqual({ count: 1 });
	});

	it('runs guard', async () => {
		const fsm = new FSM(
			{ count: 0 },
			{
				idle: {
					on: {
						CLICK: 'loading'
					},
				},
				loading: {
					on: {
						LOADED: 'idle'
					},
					guard: async (context) => context.count === 1
				}
			} as const,
			'idle',
		);
		fsm.start();
		await fsm.send('CLICK', null, { count: 1 });
		expect(fsm.state).toBe('loading');
	});

	it('runs guard and fails', async () => {
		const fsm = new FSM(
			{ count: 0 },
			{
				idle: {
					on: {
						CLICK: 'loading'
					},
				},
				loading: {
					on: {
						LOADED: 'idle'
					},
					guard: async (context) => context.count === 1
				}
			} as const,
			'idle',
		);
		fsm.start();
		await fsm.send('CLICK', { count: 0 });
		expect(fsm.state).toBe('idle');
	});

	it('runs enter', async () => {
		const fsm = new FSM(
			{ count: 0 },
			{
				idle: {
					on: {
						CLICK: 'loading'
					},
					enter: async (context) => ({ ...context, count: 1 })
				},
				loading: {
					on: {
						LOADED: 'idle'
					}
				}
			} as const,
			'idle',
		);
		fsm.start();
		await fsm.send('CLICK');
		expect(fsm.context).toEqual({ count: 1 });
	});

	it('sends some data with the event', async () => {
		const fsm = new FSM(
			{ count: 0 },
			{
				idle: {
					on: {
						CLICK: (context, data) => {
							context.count = data;
							return 'loading' as const;
						}
					}
				},
				loading: {
					on: {
						LOADED: 'idle'
					}
				}
			} as const,
			'idle',
		);
		fsm.start();
		await fsm.send('CLICK', 6);
		expect(fsm.context).toEqual({ count: 6 });
	});

	it('runs goto', async () => {
		const fsm = new FSM(
			{ count: 0 },
			{
				idle: {
					on: {
						CLICK: 'loading'
					}
				},
				loading: {
					enter: async (context) => ({ ...context, count: 1 }),
					goto: 'idle'
				}
			} as const,
			'idle',
		);
		fsm.start();
		await fsm.send('CLICK');
		expect(fsm.context).toEqual({ count: 1 });
		expect(fsm.state).toBe('idle');
	});

	it('can return a state to go to from guard', async () => {
		const fsm = new FSM(
			{ count: 0 },
			{
				idle: {
					on: {
						CLICK: (context, data) => {
							context.count = context.count + 1;
							return 'loading' as const;
						}
					},
				},
				loading: {
					guard: async (context) => {
						if(context.count === 2) return 'full';
						return false;
					},
					goto: 'idle'
				},
				full: {}
			} as const,
			'idle',
		);
		fsm.start();
		await fsm.send('CLICK');
		expect(fsm.state).toBe('idle');
		await fsm.send('CLICK');
		expect(fsm.state).toBe('full');
	});

	it('runs guard upon initial state', async () => {
		const fsm = new FSM(
			{ count: 0 },
			{
				idle: {
					guard: async (context) => {
						if(context.count === 0) return 'loading';
						return true;
					},
					goto: 'idle'
				},
				loading: {}
			} as const,
			'idle',
		);
		await fsm.start();
		expect(fsm.state).toBe('loading');
	});
});

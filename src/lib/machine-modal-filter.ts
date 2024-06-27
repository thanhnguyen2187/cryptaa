import { setup } from 'xstate';

export const machine = setup({
}).createMachine({
  context: {},
  initial: "Idling",
  states: {
    Idling: {
      on: {
        Encrypted: 'Locked',
      },
    },
    Locked: {
      on: {
        Decrypted: 'Unlocked',
        Cleared: 'Idling',
      }
    },
    Unlocked: {
      on: {
        Cleared: 'Idling',
      }
    },
  },
});

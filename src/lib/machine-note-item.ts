import { setup } from "xstate";
import type { NoteDisplay } from '../data/schema-triplit';
import { createEmptyNoteDisplay } from '../data/data-transformation';

export const machine = setup({
  types: {
    context: {} as {
      note: NoteDisplay,
    },
    input: {} as {
      note: NoteDisplay,
    },
  }
}).createMachine({
	context: {
    note: createEmptyNoteDisplay(),
  },
	initial: "Idling",
	states: {
		Idling: {
			on: {
				Encrypted: "Locked",
			},
		},
		Locked: {
			on: {
				Decrypted: "Unlocked",
				Cleared: "Idling",
			},
		},
		Unlocked: {
			on: {
				Cleared: "Idling",
			},
		},
	},
});

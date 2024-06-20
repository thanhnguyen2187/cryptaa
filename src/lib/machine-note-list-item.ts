import { assign, setup } from "xstate";
import type { NoteDisplay } from "../data/schema-triplit";
import { createEmptyNoteDisplay } from "../data/data-transformation";

export const machine = setup({
  types: {
    events: {} as
      | { type: "DecryptedText"; decryptedText: string }
      | { type: "Clear"; decryptedText: string },
    context: {} as {
      note: NoteDisplay;
    },
    input: {} as {
      note: NoteDisplay;
    },
  },
  guards: {},
}).createMachine({
  context: ({ input }) => ({
    note: input.note,
  }),
  initial: "Idling",
  states: {
    Idling: {
      always: [
        {
          guard: ({ context }) => context.note.encryptionState === "encrypted",
          target: "Encrypted",
        },
      ],
    },
    Encrypted: {
      on: {
        DecryptedText: {
          target: "Decrypted",
          actions: assign({
            note: ({ context, event }) => ({
              ...context.note,
              text: event.decryptedText,
              encrypted: false,
            }),
          }),
        },
        Clear: {
          target: "Idling",
          actions: assign({
            note: ({ context, event }) => ({
              ...context.note,
              text: event.decryptedText,
              encrypted: false,
            }),
          }),
        },
      },
    },
    Decrypted: {
      on: {
        Clear: "Idling",
      },
    },
  },
});

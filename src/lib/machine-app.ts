import { assign, fromPromise, setup } from "xstate";
import type { NoteDisplay } from "../data/schema-triplit";
import {
  createEmptyNoteDisplay,
  encryptNote,
} from "../data/data-transformation";
import type { TriplitClient } from "@triplit/client";
import {
  noteCount,
  notesDelete,
  notesRead,
  notesUpsert,
} from "../data/queries-triplit";
import type { ToastManager } from "$lib/toast-manager";
import { registerServiceWorker } from "$lib/sw-registration";
import type { ModalManager } from "$lib/modal-manager";
import {
  logicModalConfirm,
  logicModalNote,
  logicModalPassword,
} from "$lib/logic-modal";
import type { Modal, ModalStore } from "@skeletonlabs/skeleton";

export const logicNotesRead = fromPromise(
  async ({
    input,
  }: {
    input: {
      client: TriplitClient;
      limit: number;
      keyword: string;
      tags: Set<string>;
    };
  }) => {
    return notesRead(input.client, input.limit, input.keyword, input.tags);
  },
);

export const logicNotesCount = fromPromise(
  async ({
    input,
  }: {
    input: {
      client: TriplitClient;
      keyword: string;
      tags: Set<string>;
    };
  }) => {
    return noteCount(input.client, input.keyword, input.tags);
  },
);

export const logicNotesUpsert = fromPromise(
  async ({
    input,
  }: {
    input: {
      client: TriplitClient;
      note: NoteDisplay;
      noteEncrypting: boolean;
      password: string;
    };
  }) => {
    if (!input.noteEncrypting) {
      await notesUpsert(input.client, input.note);
    } else {
      const encryptedNote = await encryptNote(input.note, input.password);
      await notesUpsert(input.client, encryptedNote);
    }
  },
);

export const logicNotesEncrypt = fromPromise(
  async ({
    input,
  }: {
    input: {
      note: NoteDisplay;
      password: string;
    };
  }) => {
    return encryptNote(input.note, input.password);
  },
);

export const logicNotesDelete = fromPromise(
  async ({
    input,
  }: {
    input: {
      client: TriplitClient;
      noteId: string;
    };
  }) => {
    return notesDelete(input.client, input.noteId);
  },
);

export const logicRegisterSW = fromPromise(registerServiceWorker);

export type Context = {
  client: TriplitClient;
  notes: NoteDisplay[];
  note: NoteDisplay;
  noteEncrypting: boolean;
  password: string;
  limit: number;
  notesTotalCount: number;
  tags: Set<string>;
  keyword: string;
  toastManager: ToastManager;
  modalStore?: ModalStore;
};

export type Input = {
  client: TriplitClient;
  toastManager: ToastManager;
};

export const machine = setup({
  types: {
    context: {} as Context,
    events: {} as
      | { type: "SetToastManager"; value: ToastManager }
      | { type: "SetModalStore"; value: ModalStore }
      | { type: "SetNote"; value: NoteDisplay }
      | { type: "SetLimit"; value: number }
      | { type: "Save"; note: NoteDisplay }
      | { type: "EncryptAndSave"; note: NoteDisplay }
      | { type: "Submit"; password: string }
      | { type: "Delete"; note: NoteDisplay }
      | { type: "Yes" }
      | { type: "No" }
      | { type: "Reload" }
      | { type: "ModalOpenNoteNew" }
      | { type: "ModalClosed" }
      | { type: "Check" }
      | { type: "Cancel" }
      | { type: "Failed" }
      | { type: "FailedData" }
      | { type: "Succeeded" }
      | { type: "OpenFilter" }
      | { type: "FailedAction" }
      | { type: "OpenSettings" }
      | { type: "SucceededAction" }
      | { type: "Retry" }
      | { type: "Input" }
      | { type: "Clear" }
      | { type: "Retried" }
      | { type: "Error" }
      | { type: "Loaded"; notes: NoteDisplay[]; totalCount: number }
      | { type: "SearchTagAdd"; tag: string }
      | { type: "SearchTagRemove"; tag: string }
      | { type: "SearchKeywordSet"; keyword: string }
      | { type: "LimitSet"; limit: number }
      | { type: "ModalOpenNote"; note: NoteDisplay }
      | { type: "ModalOpenEncryption"; note: NoteDisplay }
      | { type: "ModalOpenSettings" }
      | { type: "ModalConfirmDeletion" }
      | { type: "ModalCancel" }
      | { type: "ServiceWorkerInitialized" },
    input: {} as Input,
  },
  guards: {
    IsNotesEmpty: ({ context }) => context.notes.length === 0,
  },
  actors: {
    logicNotesRead,
    logicNotesUpsert,
    logicRegisterSW,
    logicModalNote,
    logicNotesEncrypt,
  },
}).createMachine({
  context: ({ input }) => ({
    notes: [],
    note: createEmptyNoteDisplay(),
    noteEncrypting: false,
    password: "",
    notesTotalCount: 0,
    limit: 10,
    tags: new Set(),
    keyword: "",
    toastManager: input.toastManager,
    modalStore: undefined,
    client: input.client,
  }),
  id: "App",
  initial: "ServiceWorkerInitializing",
  on: {
    SetToastManager: {
      actions: assign({
        toastManager: ({ event }) => event.value,
      }),
    },
    SetModalStore: {
      actions: assign({
        modalStore: ({ event }) => event.value,
      }),
    },
    SetLimit: {
      actions: assign({
        limit: ({ event }) => event.value,
      }),
    },
  },
  states: {
    ServiceWorkerInitializing: {
      invoke: {
        src: logicRegisterSW,
        onDone: { target: "DataLoading" },
        onError: {
          target: "DataLoading",
          actions: ({ context, event }) => {
            context.toastManager.warn(
              "Error happened registering service worker",
            );
            console.warn(event.error);
          },
        },
      },
    },
    DataLoading: {
      type: "parallel",
      states: {
        Records: {
          initial: "Loading",
          states: {
            Loading: {
              invoke: {
                src: logicNotesRead,
                input: ({ context }) => ({
                  client: context.client,
                  limit: context.limit,
                  keyword: context.keyword,
                  tags: context.tags,
                }),
                onDone: {
                  target: "Loaded",
                  actions: assign({
                    notes: ({ event }) => event.output as NoteDisplay[],
                  }),
                },
                onError: {
                  target: "#App.DataError",
                  actions: ({ context, event }) => {
                    context.toastManager.error("Error happened fetching data");
                    console.error(event.error);
                  },
                },
              },
            },
            Loaded: {
              type: "final",
            },
          },
        },
        Count: {
          initial: "Loading",
          states: {
            Loading: {
              invoke: {
                src: logicNotesCount,
                input: ({ context }) => ({
                  client: context.client,
                  keyword: context.keyword,
                  tags: context.tags,
                }),
                onDone: {
                  target: "Loaded",
                  actions: assign({
                    notesTotalCount: ({ event }) => event.output as number,
                  }),
                },
                onError: {
                  target: "#App.DataError",
                  actions: ({ context, event }) => {
                    context.toastManager.error("Error happened fetching data");
                    console.error(event.error);
                  },
                },
              },
            },
            Loaded: {
              type: "final",
            },
          },
        },
      },
      onDone: "Idling",
    },
    DataUpserting: {
      invoke: {
        src: logicNotesUpsert,
        input: ({ context }) => ({
          client: context.client,
          note: context.note,
          noteEncrypting: context.noteEncrypting,
          password: context.password,
        }),
        onDone: {
          target: "DataLoading",
        },
        onError: {
          target: "DataError",
          actions: ({ context, event }) => {
            context.toastManager.error("Error happened fetching data");
            console.error(event.error);
          },
        },
      },
    },
    DataEncrypting: {
      invoke: {
        src: logicNotesEncrypt,
        input: ({ context }) => ({
          note: context.note,
          password: context.password,
        }),
        onDone: {
          target: "DataUpserting",
          actions: assign({
            note: ({ event }) => event.output as NoteDisplay,
          }),
        },
        onError: {
          target: "DataError",
          actions: ({ context, event }) => {
            context.toastManager.error("Error happened encrypting data");
            console.error(event.error);
          },
        },
      },
    },
    DataDeleting: {
      invoke: {
        src: logicNotesDelete,
        input: ({ context }) => ({
          client: context.client,
          noteId: context.note.id,
        }),
        onDone: {
          target: "DataLoading",
        },
        onError: {
          target: "DataError",
          actions: ({ context, event }) => {
            context.toastManager.error("Error happened deleting data");
            console.error(event.error);
          },
        },
      },
    },
    Idling: {
      type: "parallel",
      states: {
        Items: {
          initial: "Transient",
          on: {
            ModalOpenNoteNew: {
              target: "#App.Idling.Modal.Note",
              actions: assign({
                note: createEmptyNoteDisplay(),
              }),
            },
            Reload: {
              target: "#App.DataLoading",
            },
            Delete: {
              target: "#App.Idling.Modal.DeleteConfirm",
              actions: assign({
                note: ({ event }) => event.note,
              }),
            },
          },
          states: {
            Transient: {
              always: [
                {
                  guard: "IsNotesEmpty",
                  target: "Empty",
                },
                {
                  target: "Filled",
                },
              ],
            },
            Empty: {},
            Filled: {},
          },
        },
        Modal: {
          initial: "None",
          on: {
            ModalClosed: {
              target: "#App.Idling.Modal.None",
            },
          },
          states: {
            None: {},
            Note: {
              on: {
                Save: {
                  actions: assign({
                    note: ({ event }) => event.note,
                    noteEncrypting: () => false,
                  }),
                  target: "#App.DataUpserting",
                },
                EncryptAndSave: {
                  actions: assign({
                    note: ({ event }) => event.note,
                    noteEncrypting: () => true,
                  }),
                  target: "Password",
                },
              },
              invoke: {
                src: logicModalNote,
                input: ({ context }) => ({
                  client: context.client,
                  modalStore: context.modalStore,
                  note: context.note,
                }),
              },
            },
            Password: {
              on: {
                Submit: {
                  actions: assign({
                    password: ({ event }) => event.password,
                  }),
                  target: "#App.DataEncrypting",
                },
              },
              invoke: {
                src: logicModalPassword,
                input: ({ context }) => ({
                  modalStore: context.modalStore,
                }),
              },
            },
            DeleteConfirm: {
              on: {
                Yes: {
                  target: "#App.DataDeleting",
                },
                No: {
                  target: "#App.Idling",
                },
              },
              invoke: {
                src: logicModalConfirm,
                input: ({ context }) => ({
                  modalStore: context.modalStore,
                }),
              },
            },
          },
        },
      },
    },
    DataError: {},
  },
});

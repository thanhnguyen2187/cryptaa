import {
  assign,
  type EventObject,
  fromCallback,
  fromPromise,
  setup,
} from "xstate";
import type { NoteDisplay } from "../data/schema-triplit";
import {
  createEmptyNoteDisplay,
  encryptNote, noteDbToDisplay,
} from "../data/data-transformation";
import type { TriplitClient } from "@triplit/client";
import {
  noteCount, notesCountSubscribe,
  notesDelete,
  notesRead,
  notesSubscribe,
  notesUpsert,
} from "../data/queries-triplit";
import type { ToastManager } from "$lib/toast-manager";
import { registerServiceWorker } from "$lib/sw-registration";
import {
  logicModalConfirm,
  logicModalNote,
  logicModalPassword,
  logicModalSettings,
} from "$lib/logic-modal";
import type { Modal, ModalStore } from "@skeletonlabs/skeleton";
import { aesGcmDecrypt } from "../data/encryption";

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
    };
  }) => {
    await notesUpsert(input.client, input.note);
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

export const logicNotesDecrypt = fromPromise(
  async ({
    input,
  }: {
    input: {
      note: NoteDisplay;
      password: string;
    };
  }) => {
    const decryptedText = await aesGcmDecrypt(input.note.text, input.password);
    // const decryptedNote: NoteDisplay = {
    //   ...input.note,
    //   text: decryptedText,
    //   encrypted: false,
    // };
    // return decryptedNote;
    input.note.text = decryptedText;
    input.note.encryptionState = "decrypted";
    // WARN: this is a hacky way to make local decryption works, as the returned
    // `note` is mutated and thus changes are detected and applied.
    return input.note;
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

export const logicNotesSubscribe = fromCallback<
  EventObject,
  { client: TriplitClient; limit: number; keyword: string; tags: Set<string> }
>(({ sendBack, input }) => {
  const fnUnsubscribe = notesSubscribe(
    input.client,
    input.limit,
    input.keyword,
    input.tags,
    (results) => {
      const noteDbs = Array.from(results.values());
      const noteDisplays = noteDbs.map(noteDbToDisplay);
      sendBack({type: "SetNotes", value: noteDisplays});
    },
    (error) => {},
  );
  return fnUnsubscribe;
});

export const logicNotesCountSubscribe = fromCallback<
  EventObject,
  { client: TriplitClient; limit: number; keyword: string; tags: Set<string> }
>(({ sendBack, input }) => {
  const fnUnsubscribe = notesCountSubscribe(
    input.client,
    input.keyword,
    input.tags,
    (count) => {
      sendBack({type: "SetNotesTotalCount", value: count});
    },
    (error) => {},
  );
  return fnUnsubscribe;
});

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
      | { type: "Decrypt"; note: NoteDisplay }
      | { type: "Encrypt"; note: NoteDisplay }
      | { type: "Clear"; note: NoteDisplay }
      | { type: "SetNotes"; value: NoteDisplay[] }
      | { type: "SetNotesTotalCount"; value: number }
      | { type: "TagAdd"; tag: string }
      | { type: "TagDelete"; tag: string }
      | { type: "SetKeyword"; value: string }
      | { type: "Yes" }
      | { type: "No" }
      | { type: "Reload" }
      | { type: "ModalOpenNoteNew" }
      | { type: "ModalOpenNote"; note: NoteDisplay }
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
      | { type: "Retried" }
      | { type: "Error" }
      | { type: "Loaded"; notes: NoteDisplay[]; totalCount: number }
      | { type: "SearchTagAdd"; tag: string }
      | { type: "SearchTagRemove"; tag: string }
      | { type: "SearchKeywordSet"; keyword: string }
      | { type: "LimitSet"; limit: number }
      | { type: "ModalOpenEncryption"; note: NoteDisplay }
      | { type: "ModalOpenSettings" }
      | { type: "ModalConfirmDeletion" }
      | { type: "ModalCancel" }
      | { type: "ServiceWorkerInitialized" },
    input: {} as Input,
  },
  guards: {
    IsNotesEmpty: ({ context }) => context.notes.length === 0,
    IsWrongPassword: (_, params: { error: Error }) =>
      params.error.message === "Decrypt failed",
    IsWrongFormat: (_, params: { error: Error }) =>
      params.error.message === "Invalid ciphertext",
  },
  actors: {
    logicNotesRead,
    logicNotesUpsert,
    logicRegisterSW,
    logicModalNote,
    logicNotesEncrypt,
    logicNotesDecrypt,
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
        onDone: { target: "Idling" },
        onError: {
          target: "Idling",
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
        }),
        onDone: {
          target: "Idling",
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
    DataDecrypting: {
      invoke: {
        src: logicNotesDecrypt,
        input: ({ context }) => ({
          note: context.note,
          password: context.password,
        }),
        onDone: {
          target: "Idling",
          actions: assign({
            note: ({ event }) => {
              return event.output as NoteDisplay;
            },
          }),
        },
        onError: [
          {
            guard: {
              type: "IsWrongPassword",
              params: ({ event }) => ({ error: event.error as Error }),
            },
            actions: ({ context }) =>
              context.toastManager.warn("Wrong password"),
            target: "Idling",
          },
          {
            guard: {
              type: "IsWrongFormat",
              params: ({ event }) => ({ error: event.error as Error }),
            },
            actions: ({ context }) =>
              context.toastManager.error("Invalid text format"),
            target: "Idling",
          },
          {
            actions: ({ event }) => console.error(event.error),
            target: "DataError",
          },
        ],
      },
    },
    DataClearing: {
      invoke: {
        src: logicNotesDecrypt,
        input: ({ context }) => ({
          note: context.note,
          password: context.password,
        }),
        onDone: {
          target: "DataUpserting",
          actions: assign({
            note: ({ event }) => {
              return event.output as NoteDisplay;
            },
          }),
        },
        onError: [
          {
            guard: {
              type: "IsWrongPassword",
              params: ({ event }) => ({ error: event.error as Error }),
            },
            actions: ({ context }) =>
              context.toastManager.warn("Wrong password"),
            target: "Idling",
          },
          {
            guard: {
              type: "IsWrongFormat",
              params: ({ event }) => ({ error: event.error as Error }),
            },
            actions: ({ context }) =>
              context.toastManager.error("Invalid text format"),
            target: "Idling",
          },
          {
            actions: ({ event }) => console.error(event.error),
            target: "DataError",
          },
        ],
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
          target: "Idling",
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
          on: {
            ModalOpenNoteNew: {
              target: "#App.Idling.Modal.Note",
              actions: assign({
                note: createEmptyNoteDisplay(),
              }),
            },
            ModalOpenNote: {
              target: "#App.Idling.Modal.Note",
              actions: assign({
                note: ({ event }) => event.note,
              }),
            },
            ModalOpenSettings: {
              target: "#App.Idling.Modal.Settings",
              actions: assign({}),
            },
            Reload: {
              target: "#App.Idling",
            },
            Delete: {
              target: "#App.Idling.Modal.DeleteConfirm",
              actions: assign({
                note: ({ event }) => event.note,
              }),
            },
            Decrypt: {
              actions: assign({
                note: ({ event }) => event.note,
              }),
              target: "#App.Idling.Modal.PasswordDecrypt",
            },
            Encrypt: {
              actions: assign({
                note: ({ event }) => event.note,
              }),
              target: "#App.Idling.Modal.PasswordEncrypt",
            },
            Clear: {
              actions: assign({
                note: ({ event }) => event.note,
              }),
              target: "#App.Idling.Modal.PasswordClear",
            },
            TagAdd: {
              actions: assign({
                tags: ({context, event}) => {
                  context.tags.add(event.tag);
                  return new Set(context.tags);
                },
              }),
              target: "#App.Idling",
            },
            TagDelete: {
              actions: assign({
                tags: ({context, event}) => {
                  context.tags.delete(event.tag);
                  return new Set(...context.tags);
                },
              }),
              target: "#App.Idling",
            },
            SetKeyword: {
              actions: assign({
                keyword: ({event}) => event.value,
              }),
              target: "#App.Idling",
            }
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
                  }),
                  target: "PasswordEncrypt",
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
            PasswordEncrypt: {
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
            PasswordDecrypt: {
              on: {
                Submit: {
                  actions: assign({
                    password: ({ event }) => event.password,
                  }),
                  target: "#App.DataDecrypting",
                },
              },
              invoke: {
                src: logicModalPassword,
                input: ({ context }) => ({
                  modalStore: context.modalStore,
                }),
              },
            },
            PasswordClear: {
              on: {
                Submit: {
                  actions: assign({
                    password: ({ event }) => event.password,
                  }),
                  target: "#App.DataClearing",
                },
              },
              invoke: {
                src: logicModalPassword,
                input: ({ context }) => ({
                  modalStore: context.modalStore,
                }),
              },
            },
            Settings: {
              invoke: {
                src: logicModalSettings,
                input: ({ context }) => ({
                  modalStore: context.modalStore,
                }),
              },
            },
          },
        },
        SubscribingNotes: {
          type: "parallel",
          states: {
            Notes: {
              invoke: {
                src: logicNotesSubscribe,
                input: ({ context }) => ({
                  client: context.client,
                  limit: context.limit,
                  keyword: context.keyword,
                  tags: context.tags,
                }),
              },
            },
            Count: {
              invoke: {
                src: logicNotesCountSubscribe,
                input: ({ context }) => ({
                  client: context.client,
                  keyword: context.keyword,
                  tags: context.tags,
                }),
              },
            }
          },
          on: {
            SetNotes: {
              actions: assign({
                notes: ({ event }) => event.value,
              }),
            },
            SetNotesTotalCount: {
              actions: assign({
                notesTotalCount: ({ event }) => event.value,
              }),
            },
          },
        },
      },
    },
    DataError: {},
  },
});

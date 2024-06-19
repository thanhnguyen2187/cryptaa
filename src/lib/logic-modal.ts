import type { ModalStore } from "@skeletonlabs/skeleton";
import { type EventObject, fromCallback } from "xstate";
import type { NoteDisplay } from "../data/schema-triplit";
import ModalNote from "../components/ModalNote.svelte";
import ModalEncryption from '../components/ModalEncryption.svelte';
import type { TriplitClient } from "@triplit/client";
import { notesUpsert } from "../data/queries-triplit";
import { encryptNote } from "../data/data-transformation";

export const logicModalNote = fromCallback<
  EventObject,
  {
    client: TriplitClient;
    modalStore?: ModalStore;
    note: NoteDisplay;
  }
>(({ sendBack, receive, input }) => {
  if (!input.modalStore) {
    console.error("logicModalNote: unreachable code");
    return;
  }
  input.modalStore.trigger({
    type: "component",
    component: {
      ref: ModalNote,
      props: {
        note: input.note,
        fnSave: async () => {
          // @ts-ignore
          input.modalStore.close();
          sendBack({ type: "Save", note: input.note });
        },
        fnEncryptAndSave: () => {
          // @ts-ignore
          input.modalStore.close();
          sendBack({ type: "EncryptAndSave", note: input.note });
        },
        fnCancel: () => {
          // @ts-ignore
          input.modalStore.close();
          sendBack({ type: "ModalClosed" });
        },
      },
    },
    response: () => {
      sendBack({ type: "ModalClosed" });
    },
  });
});

export const logicModalPassword = fromCallback<
  EventObject,
  {
    modalStore?: ModalStore;
  }
>(({ sendBack, receive, input }) => {
  if (!input.modalStore) {
    console.error("logicModalPassword: unreachable code");
    return;
  }
  input.modalStore.trigger({
    type: "component",
    component: {
      ref: ModalEncryption,
      props: {
        showWarning: false,
        fnSubmit: (password: string) => {
          // @ts-ignore
          input.modalStore.close();
          sendBack({ type: "Submit", password });
        },
        fnCancel: () => {
          // @ts-ignore
          input.modalStore.close();
          sendBack({ type: "ModalClosed" });
        },
      },
    },
    response: () => {
      sendBack({ type: "ModalClosed" });
    },
  });
});

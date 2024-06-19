import type { ModalStore } from "@skeletonlabs/skeleton";
import type { NoteDisplay } from "../data/schema-triplit";
import ModalNote from '../components/ModalNote.svelte';

export type ModalManager = {
  showNote(note: NoteDisplay): void;
  showSettings(): void;
  showPassword(): void;
};

export function createModalManagerDummy(): ModalManager {
  return {
    showNote() {},
    showSettings() {},
    showPassword() {},
  };
}

export function createModalManagerSkeleton(
  modalStore: ModalStore,
  fnSendModalClosed: () => void,
): ModalManager {
  return {
    showNote(note: NoteDisplay) {
      modalStore.trigger({
        type: "component",
        component: {
          ref: ModalNote,
          props: {
            note,
          },
        },
        response: fnSendModalClosed,
      });
    },
    showSettings() {},
    showPassword() {},
  };
}

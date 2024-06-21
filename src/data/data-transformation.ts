import type { Note, NoteDisplay, NoteWithoutID } from "./schema-triplit";
import { aesGcmEncrypt } from "./encryption";

export function createEmptyNoteDisplay(): NoteDisplay {
  return {
    id: "",
    title: "To be filled",
    text: "To be filled",
    tags: ["tag-1", "tag-2"],
    encryptionState: "none",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function encryptNote(
  originalNote: NoteDisplay,
  password: string,
): Promise<NoteDisplay> {
  const encryptedText = await aesGcmEncrypt(originalNote.text, password);
  const encryptedNote: NoteDisplay = {
    ...originalNote,
    text: encryptedText,
    encryptionState: "encrypted",
  };
  return encryptedNote;
}

export function noteDbToDisplay(noteDb: Note): NoteDisplay {
  return {
    ...noteDb,
    encryptionState: noteDb.encrypted ? "encrypted" : "none",
    tags: Array.from((noteDb.tags ?? new Set()).keys()).sort(),
  };
}

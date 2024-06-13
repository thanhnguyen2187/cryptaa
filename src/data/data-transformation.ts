import type { NoteDisplay, NoteWithoutID } from "./schema-triplit";
import { aesGcmEncrypt } from "./encryption";

export function createEmptyNoteDisplay(): NoteDisplay {
	return {
		id: "",
		title: "To be filled",
		text: "To be filled",
		tags: ["tag-1", "tag-2"],
		encrypted: false,
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
		encrypted: true,
	};
	return encryptedNote;
}

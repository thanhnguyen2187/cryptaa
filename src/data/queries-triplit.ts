import type { TriplitClient } from "@triplit/client";
import { or } from "@triplit/db";
import type { NoteDisplay } from "./schema-triplit";

export async function notesRead(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  client: TriplitClient<any>,
  limit: number,
  keyword: string,
  tags: Set<string>,
): Promise<NoteDisplay[]> {
  let query = client.query("notes").order("createdAt", "ASC").limit(limit);
  if (keyword !== "") {
    query = query.where(
      or([
        ["title", "like", `%${keyword}%`],
        ["text", "like", `%${keyword}%`],
      ]),
    );
  }
  for (const tag of tags) {
    query = query.where("tags", "has", tag);
  }
  const result = await client.fetch(query.build(), {
    policy: "local-and-remote",
  });
  const notes = Array.from(result.values());
  const noteDisplays = notes.map((note) => ({
    ...note,
    tags: Array.from((note.tags ?? new Set()).keys())
      // @ts-ignore
      // .map((tag: NoteTag) => tag.tagText)
      .sort(),
  }));
  return noteDisplays;
}

export async function noteCount(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  client: TriplitClient<any>,
  keyword: string,
  tags: Set<string>,
) {
  let query = client.query("notes");
  if (keyword !== "") {
    query = query.where(
      or([
        ["title", "like", `%${keyword}%`],
        ["text", "like", `%${keyword}%`],
      ]),
    );
  }
  for (const tag of tags) {
    query = query.where("tags", "has", tag);
  }
  const result = await client.fetch(query.build(), {
    policy: "local-and-remote",
  });
  const notes = Array.from(result.values());
  const count = notes.length;
  return count;
}

export async function notesUpsert(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  client: TriplitClient<any>,
  noteDisplay: NoteDisplay,
) {
  const noteId = noteDisplay.id;
  if (noteId === "") {
    await client.insert("notes", {
      title: noteDisplay.title,
      text: noteDisplay.text,
      tags: new Set(noteDisplay.tags),
      encrypted: noteDisplay.encrypted,
    });
  } else {
    await client.insert("notes", {
      id: noteId,
      title: noteDisplay.title,
      text: noteDisplay.text,
      tags: new Set(noteDisplay.tags),
      encrypted: noteDisplay.encrypted,
      updatedAt: new Date(),
      createdAt: noteDisplay.createdAt,
    });
  }
}

export async function notesDelete(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  client: TriplitClient<any>,
  noteId: string,
) {
  await client.delete("notes", noteId);
}

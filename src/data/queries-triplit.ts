import type { TriplitClient } from "@triplit/client";
import { or } from "@triplit/db";
import type { Note, NoteDisplay } from "./schema-triplit";
import { noteDbToDisplay } from './data-transformation';
import type { FilterData } from '$lib/filter';

export async function notesRead(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  client: TriplitClient<any>,
  limit: number,
  keyword: string,
  tags: Set<string>,
): Promise<NoteDisplay[]> {
  let query = client.query("notes").order("createdAt", "DESC").limit(limit);
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
  const noteDisplays: NoteDisplay[] = notes.map(noteDbToDisplay);
  return noteDisplays;
}

export function notesSubscribe(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  client: TriplitClient<any>,
  filterData: FilterData,
  fnHandleSuccess: (results: Map<string, Note>) => void,
  fnHandleError: (error: unknown) => void,
): () => void {
  let query = client.query("notes").order("createdAt", "DESC").limit(filterData.limit);
  if (filterData.keyword !== "") {
    query = query.where(
      or([
        ["title", "like", `%${filterData.keyword}%`],
        ["text", "like", `%${filterData.keyword}%`],
      ]),
    );
  }
  for (const tag of filterData.tagsInclude) {
    query = query.where("tags", "has", tag);
  }
  for (const tag of filterData.tagsExclude) {
    query = query.where("tags", "!has", tag);
  }
  const fnUnsubscribe = client.subscribe(
    query.build(),
    (results, info) => {
      fnHandleSuccess(results);
    },
    (error) => {
      fnHandleError(error);
    }
  )
  // const notes = Array.from(result.values());
  // const noteDisplays: NoteDisplay[] = notes.map((note) => ({
  //   ...note,
  //   encryptionState: note.encrypted ? "encrypted" : "none",
  //   tags: Array.from((note.tags ?? new Set()).keys())
  //   // @ts-ignore
  //   // .map((tag: NoteTag) => tag.tagText)
  //   .sort(),
  // }));
  // return noteDisplays;
  return fnUnsubscribe;
}

export function notesCountSubscribe(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  client: TriplitClient<any>,
  keyword: string,
  tags: Set<string>,
  fnHandleSuccess: (count: number) => void,
  fnHandleError: (error: unknown) => void,
): () => void {
  let query = client.query("notes").select(["id"]);
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
  const fnUnsubscribe = client.subscribe(
    query.build(),
    (results, info) => {
      fnHandleSuccess(results.size);
    },
    (error) => {
      fnHandleError(error);
    }
  )
  // const notes = Array.from(result.values());
  // const noteDisplays: NoteDisplay[] = notes.map((note) => ({
  //   ...note,
  //   encryptionState: note.encrypted ? "encrypted" : "none",
  //   tags: Array.from((note.tags ?? new Set()).keys())
  //   // @ts-ignore
  //   // .map((tag: NoteTag) => tag.tagText)
  //   .sort(),
  // }));
  // return noteDisplays;
  return fnUnsubscribe;
}

export async function noteCount(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  client: TriplitClient<any>,
  keyword: string,
  tags: Set<string>,
) {
  let query = client.query("notes").select(["id"]);
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
      encrypted: noteDisplay.encryptionState === "encrypted",
    });
  } else {
    await client.insert("notes", {
      id: noteId,
      title: noteDisplay.title,
      text: noteDisplay.text,
      tags: new Set(noteDisplay.tags),
      encrypted: noteDisplay.encryptionState === "encrypted",
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

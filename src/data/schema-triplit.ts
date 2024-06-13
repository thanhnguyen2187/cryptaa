import type { ClientSchema, Entity } from "@triplit/client";
import { Schema as S } from "@triplit/client";

export const schema = {
  notes: {
    schema: S.Schema({
      id: S.Id(),
      title: S.String(),
      text: S.String(),
      encrypted: S.Boolean(),
      tags: S.Set(S.String()),
      updatedAt: S.Date({ default: S.Default.now() }),
      createdAt: S.Date({ default: S.Default.now() }),
    }),
  },
} satisfies ClientSchema;

export type Note = Entity<typeof schema, "notes">;
export type NoteDisplay = {
  id: string;
  title: string;
  text: string;
  tags: string[];
  encrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
export type NoteWithoutID = Exclude<Note, "id">;

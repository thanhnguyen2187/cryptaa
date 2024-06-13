import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { schema } from "./schema-triplit";
import { TriplitClient } from "@triplit/client";

describe("happy path", () => {
	const client = new TriplitClient({ schema });
	const note = {
		title: "Hello, World!",
		text: "This is a note.",
		encrypted: false,
		tags: [],
		updatedAt: new Date(),
		createdAt: new Date(),
	};
	it("crud", async () => {
		let insertedId = "";
		// create
		{
			const resultInsert = await client.insert("notes", note);
			expect(resultInsert.txId).toBeDefined();
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			insertedId = resultInsert.output.id!;
		}
		// read
		{
			const query = client.query("notes").build();
			const resultReadMap = await client.fetch(query);
			const resultReadArr = [...resultReadMap.values()];

			expect(resultReadArr.length).toBe(1);
			expect(resultReadArr[0]).to.contains({
				id: insertedId,
				title: note.title,
				text: note.text,
			});
		}
		// update
		{
			const newText = "Another text.";
			const resultUpdate = await client.update(
				"notes",
				insertedId,
				async (entity) => {
					entity.text = newText;
				},
			);
			expect(resultUpdate.txId).toBeDefined();

			const resultReadMap = await client.fetchById("notes", insertedId);
			expect(resultReadMap).toBeDefined();
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			expect(resultReadMap!.text).toEqual(newText);
		}
		// upsert
		{
			const newText = "Other text.";
			const resultInsert = await client.insert("notes", {
				...note,
				id: insertedId,
				text: newText,
			});
			expect(resultInsert.txId).toBeDefined();

			const resultReadMap = await client.fetchById("notes", insertedId);
			expect(resultReadMap).toBeDefined();
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			expect(resultReadMap!.text).toEqual(newText);
		}
		// delete
		{
			const resultDelete = await client.delete("notes", insertedId);
			expect(resultDelete.txId).toBeDefined();
		}
	});
});

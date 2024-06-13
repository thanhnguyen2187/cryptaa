// Based on: https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a
// Added TypeScript support and changed deprecated functions (e.g. btoa in Node.js)

// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { Buffer } from "buffer";

/**
 * Encrypts plaintext using AES-GCM with supplied password, for decryption with aesGcmDecrypt().
 *                                                                      (c) Chris Veness MIT Licence
 *
 * @param   {String} plaintext - Plaintext to be encrypted.
 * @param   {String} password - Password to use to encrypt plaintext.
 * @returns {String} Encrypted ciphertext.
 *
 * @example
 *   const ciphertext = await aesGcmEncrypt('my secret text', 'pw');
 *   aesGcmEncrypt('my secret text', 'pw').then(function(ciphertext) { console.log(ciphertext); });
 */
export async function aesGcmEncrypt(
	plaintext: string,
	password: string,
): Promise<string> {
	const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
	const pwHash = await crypto.subtle.digest("SHA-256", pwUtf8); // hash the password

	const iv = crypto.getRandomValues(new Uint8Array(12)); // get 96-bit random iv
	const ivStr = Buffer.from(iv).toString("base64"); // iv as base64 string

	const alg = { name: "AES-GCM", iv: iv }; // specify algorithm to use

	const key = await crypto.subtle.importKey("raw", pwHash, alg, false, [
		"encrypt",
	]); // generate key from pw

	const ptUint8 = new TextEncoder().encode(plaintext); // encode plaintext as UTF-8
	const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8); // encrypt plaintext using key

	const ctStr = Buffer.from(ctBuffer).toString("base64"); // ciphertext as base64 string

	return `${ivStr}.${ctStr}`;
}

/**
 * Decrypts ciphertext encrypted with aesGcmEncrypt() using supplied password.
 *                                                                      (c) Chris Veness MIT Licence
 *
 * @param   {String} ciphertext - Ciphertext to be decrypted.
 * @param   {String} password - Password to use to decrypt ciphertext.
 * @returns {String} Decrypted plaintext.
 *
 * @example
 *   const plaintext = await aesGcmDecrypt(ciphertext, 'pw');
 *   aesGcmDecrypt(ciphertext, 'pw').then(function(plaintext) { console.log(plaintext); });
 */
export async function aesGcmDecrypt(
	ciphertext: string,
	password: string,
): Promise<string> {
	const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
	const pwHash = await crypto.subtle.digest("SHA-256", pwUtf8); // hash the password

	if (ciphertext.indexOf(".") === -1) {
		throw new Error("Invalid ciphertext");
	}
	const cipherSplitted = ciphertext.split(".");

	const ivStr = cipherSplitted[0]; // decode base64 iv
	const iv = Buffer.from(ivStr, "base64"); // iv as Uint8Array

	const alg = { name: "AES-GCM", iv: iv }; // specify algorithm to use

	const key = await crypto.subtle.importKey("raw", pwHash, alg, false, [
		"decrypt",
	]); // generate key from pw

	const ctStr = cipherSplitted[1]; // decode base64 iv
	const ctUint8 = Buffer.from(ctStr, "base64"); // ciphertext as Uint8Array

	try {
		const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8); // decrypt ciphertext using key
		const plaintext = new TextDecoder().decode(plainBuffer); // plaintext from ArrayBuffer
		return plaintext; // return the plaintext
	} catch (e) {
		throw new Error("Decrypt failed");
	}
}

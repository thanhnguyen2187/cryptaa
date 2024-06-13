import { http, HttpResponse, passthrough } from 'msw'
import path from 'node:path'
import fs from 'node:fs'

export const WASqliteWASMBaseURL = 'http://mock.local'
export function createWASqliteMockWASMHandler(baseUrl: string = WASqliteWASMBaseURL) {
  return [
    http.get(`${baseUrl}/wa-sqlite-async.wasm`, () => {
      const filePath = path.resolve(process.cwd(), 'static/wa-sqlite-async.wasm')
      const buffer = fs.readFileSync(filePath)
      return HttpResponse.arrayBuffer(buffer, {
        headers: {
          'Content-Type': 'application/wasm',
        }
      })
    }),
    http.get(`${baseUrl}/wa-sqlite.wasm`, () => {
      const filePath = path.resolve(process.cwd(), 'static/wa-sqlite.wasm')
      const buffer = fs.readFileSync(filePath)
      return HttpResponse.arrayBuffer(buffer, {
        headers: {
          'Content-Type': 'application/wasm',
        }
      })
    }),
  ]
}

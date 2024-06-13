export async function copyToClipboard(text: string): Promise<string | null> {
  try {
    await navigator.clipboard.writeText(text)
    return 'success'
  } catch (err) {
    console.error({
      method: 'copyToClipboard',
      error: err,
    })
    return null
  }
}

export async function getFromClipboard(): Promise<string | null> {
  try {
    return await navigator.clipboard.readText()
  } catch (err) {
    console.error({
      method: 'getFromClipboard',
      error: err,
    })
    return null
  }
}

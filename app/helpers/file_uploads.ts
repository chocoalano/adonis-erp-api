import { access, unlink } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'

export async function unlinkFile(filePath: string): Promise<boolean> {
  try {
    // Check if file exists and unlink it
    await access(path.resolve(filePath), constants.F_OK)
    await unlink(path.resolve(filePath))
    return true
  } catch {
    // Return false if an error occurs (file doesn't exist or unlink fails)
    return false
  }
}

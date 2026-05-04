export type CreateUmamiDistinctIdOptions = {
  salt?: string
  maxLength?: number
}

const DEFAULT_DISTINCT_ID_LENGTH = 50
const MIN_DISTINCT_ID_LENGTH = 1
const MAX_DISTINCT_ID_LENGTH = 50

function parseDistinctIdLength(maxLength = DEFAULT_DISTINCT_ID_LENGTH) {
  if (
    !Number.isInteger(maxLength) ||
    maxLength < MIN_DISTINCT_ID_LENGTH ||
    maxLength > MAX_DISTINCT_ID_LENGTH
  ) {
    throw new Error(
      'Umami distinct ID maxLength must be an integer from 1 to 50'
    )
  }

  return maxLength
}

function getWebCrypto() {
  if (globalThis.crypto?.subtle) {
    return globalThis.crypto
  }

  throw new Error('Umami distinct ID hashing requires Web Crypto support')
}

function bytesToLowercaseHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  )
}

export async function createUmamiDistinctId(
  input: string,
  options: CreateUmamiDistinctIdOptions = {}
) {
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Umami distinct ID input must be a non-empty string')
  }

  const maxLength = parseDistinctIdLength(options.maxLength)
  const crypto = getWebCrypto()
  const encoder = new TextEncoder()
  const digest = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(`${options.salt ?? ''}${input}`)
  )

  return bytesToLowercaseHex(new Uint8Array(digest)).slice(0, maxLength)
}

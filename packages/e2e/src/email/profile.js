export class EmailProfile {
  #seen = new Set()

  isNew(email) {
    // Use HTML content as the unique identifier.
    // HTML contains unique timestamp and ID.
    const hash = email.html || email.text

    return !this.#seen.has(hash)
  }

  markSeen(email) {
    this.#seen.add(email.html || email.text)
  }
}

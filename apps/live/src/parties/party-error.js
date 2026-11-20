// The word in `reason` is all a game is told; each game turns it into its own words.
export class PartyError extends Error {
  constructor(status, reason) {
    super(reason);
    this.status = status;
    this.reason = reason;
  }
}

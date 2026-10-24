export function createMemorySupportersStore({ now = () => new Date() } = {}) {
  const supporters = [];
  return {
    async list() {
      return supporters.map((supporter) => ({ ...supporter }));
    },
    async add(donation) {
      const supporter = { ...donation, createdAt: now() };
      supporters.push(supporter);
      return { ...supporter };
    },
    async ping() {},
  };
}

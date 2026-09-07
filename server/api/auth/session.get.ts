// Session probe for the UI (PUB-11). Always 200 — anonymous users get { user: null }.
export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  return { user: user ?? null }
})

// AUTH-5: clear the sealed session cookie, then bounce to the public home page.
// Linked as a plain <a href> so the browser does a full navigation.
export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  return sendRedirect(event, '/')
})

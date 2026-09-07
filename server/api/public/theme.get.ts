// Tiny public endpoint consumed by plugins/theme.server.ts during SSR.
export default defineEventHandler(() => getThemeColors())

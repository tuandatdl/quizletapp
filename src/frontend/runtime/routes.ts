/** Routes remain path-based; HashRouter adds the # prefix in the static Pages build. */
export const APP_ROUTES = {
  addVocabulary: "/add",
  addReading: "/reading/new",
} as const;

export function toStaticHashRoute(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `#${normalized}`;
}

export const messages = {
  created: (resource: string) => `${resource} created successfully.`,
  updated: (resource: string) => `${resource} updated successfully.`,
  deleted: (resource: string) => `${resource} deleted successfully.`,
  notFound: (resource: string) => `${resource} not found.`,
  notAuthorized: 'You are not authorized to access this resource.',
}

import path from 'path';

export class RouteDetector {
  /**
   * Detect Next.js and file-system convention routes across repository files
   * @param {Array<Object>} repositoryFiles
   * @param {Map<number, Object>} parsedFilesMap - fileId -> parsedFile
   * @returns {Array<Object>} routes list
   */
  static detectConventionRoutes(repositoryFiles = [], parsedFilesMap = new Map()) {
    const routes = [];

    for (const file of repositoryFiles) {
      const normalizedPath = (file.path || '').replace(/\\/g, '/');

      // 1. Next.js App Router API routes: app/api/users/route.ts -> /api/users
      const appApiMatch = normalizedPath.match(/^(?:src\/)?app(\/api\/.+?)\/route\.[jt]sx?$/i);
      if (appApiMatch) {
        const routePath = appApiMatch[1];
        const parsed = parsedFilesMap.get(file.id);
        const exportedNames = parsed?.exports?.map(e => e.name.toUpperCase()) || [];
        const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

        let matchedAny = false;
        for (const method of httpMethods) {
          if (exportedNames.includes(method)) {
            matchedAny = true;
            routes.push({
              fileId: file.id,
              method,
              path: routePath,
              handler: method,
              framework: 'Next.js App Router',
              lineStart: 1,
              lineEnd: 1
            });
          }
        }

        if (!matchedAny) {
          routes.push({
            fileId: file.id,
            method: 'ALL',
            path: routePath,
            handler: 'routeHandler',
            framework: 'Next.js App Router',
            lineStart: 1,
            lineEnd: 1
          });
        }
      }

      // 2. Next.js Pages Router API routes: pages/api/users.ts -> /api/users
      const pagesApiMatch = normalizedPath.match(/^(?:src\/)?pages(\/api\/.+?)(?:\/index)?\.[jt]sx?$/i);
      if (pagesApiMatch) {
        const routePath = pagesApiMatch[1];
        routes.push({
          fileId: file.id,
          method: 'ALL',
          path: routePath,
          handler: 'defaultHandler',
          framework: 'Next.js Pages Router',
          lineStart: 1,
          lineEnd: 1
        });
      }
    }

    return routes;
  }
}

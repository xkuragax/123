// Простой роутер для Cloudflare Worker

export class Router {
  constructor() {
    this.routes = [];
  }

  add(method, pattern, handler) {
    // Преобразуем паттерн в regex
    const paramNames = [];
    let regexPattern = pattern
      .replace(/:([^/]+)/g, (match, name) => {
        paramNames.push(name);
        return '([^/]+)';
      })
      .replace(/\*/g, '.*');
    
    regexPattern = '^' + regexPattern + '$';
    
    this.routes.push({
      method: method.toUpperCase(),
      pattern: new RegExp(regexPattern),
      paramNames,
      handler,
    });
  }

  get(pattern, handler) {
    this.add('GET', pattern, handler);
  }

  post(pattern, handler) {
    this.add('POST', pattern, handler);
  }

  put(pattern, handler) {
    this.add('PUT', pattern, handler);
  }

  delete(pattern, handler) {
    this.add('DELETE', pattern, handler);
  }

  options(pattern, handler) {
    this.add('OPTIONS', pattern, handler);
  }

  async handle(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toUpperCase();

    for (const route of this.routes) {
      if (route.method !== method && route.method !== '*') {
        continue;
      }

      const match = pathname.match(route.pattern);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });

        try {
          return await route.handler(request, env, params);
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err.message }),
            { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }
    }

    return null;
  }
}

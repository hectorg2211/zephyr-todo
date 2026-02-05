import { handleParse, handleBreakDown } from './openai-api.mjs';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export function createOpenAiMiddleware() {
  return async (req, res, next) => {
    const url = req.url ?? '';
    const method = req.method ?? '';

    if (method !== 'POST' || (!url.startsWith('/api/openai/parse') && !url.startsWith('/api/openai/break-down'))) {
      next();
      return;
    }

    res.setHeader('Content-Type', 'application/json');

    try {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};

      if (url.startsWith('/api/openai/parse')) {
        const result = await handleParse(body);
        res.statusCode = 200;
        res.end(JSON.stringify(result));
      } else if (url.startsWith('/api/openai/break-down')) {
        const result = await handleBreakDown(body);
        res.statusCode = 200;
        res.end(JSON.stringify(result));
      } else {
        next();
      }
    } catch (err) {
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          error: err instanceof Error ? err.message : 'Something went wrong.',
        })
      );
    }
  };
}

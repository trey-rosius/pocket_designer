import * as http from 'http';

const PORT = process.env.STITCH_DUMMY_PORT || 3001;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/mcp') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const json = JSON.parse(body);
        const { method, params, id } = json;

        if (method === 'tools/call') {
          const { name, arguments: args } = params;
          console.log(`Dummy Stitch: Calling tool ${name} with args:`, args);

          let result: any = {};

          switch (name) {
            case 'create_project':
              result = {
                name: `projects/dummy-project-${Date.now()}`,
                title: args.title || 'Dummy Project'
              };
              break;
            case 'generate_screen_from_text':
              result = {
                name: `projects/${args.projectId}/screens/dummy-screen-${Date.now()}`,
                title: 'Generated Dummy Screen'
              };
              break;
            case 'get_screen':
              result = {
                name: args.name,
                htmlCode: { downloadUri: `http://localhost:${PORT}/download/html` },
                screenshot: { downloadUri: `http://localhost:${PORT}/download/screenshot` }
              };
              break;
            case 'list_projects':
              result = {
                projects: [
                  { name: 'projects/dummy-1', title: 'Example Project 1' },
                  { name: 'projects/dummy-2', title: 'Example Project 2' }
                ]
              };
              break;
            case 'list_screens':
              result = {
                screens: [
                  { name: `projects/${args.projectId}/screens/s1`, title: 'Home' },
                  { name: `projects/${args.projectId}/screens/s2`, title: 'Settings' }
                ]
              };
              break;
            default:
              res.writeHead(404);
              res.end(JSON.stringify({ error: `Tool ${name} not found` }));
              return;
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: JSON.stringify(result) }]
            }
          }));
        } else {
          res.writeHead(400);
          res.end('Unsupported method');
        }
      } catch (e) {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });
  } else if (req.url === '/download/html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><body><h1>Dummy Design</h1><p>This is a mock design from the dummy Stitch server.</p></body></html>');
  } else if (req.url === '/download/screenshot') {
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(Buffer.alloc(100)); // Dummy empty image
  } else if (req.url === '/') {
    res.writeHead(200);
    res.end('Stitch Dummy Server Running');
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Stitch Dummy Server listening on port ${PORT}`);
});

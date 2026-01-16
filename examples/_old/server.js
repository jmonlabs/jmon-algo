const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json"
};

Deno.serve({ port: 3000 }, async (req) => {
  let path = new URL(req.url).pathname;
  if (path === "/") path = "/examples/index.html";
  if (path === "/ide.html") path = "/examples/ide.html";
  
  try {
    const file = await Deno.readFile(".." + path);
    const ext = path.substring(path.lastIndexOf("."));
    const contentType = MIME[ext] || "text/plain";
    
    return new Response(file, {
      headers: { "content-type": contentType }
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
});

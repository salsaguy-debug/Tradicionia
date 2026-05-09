export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/hello") {
      return Response.json({
        message: "Hello Angel — your Cloudflare API is live!"
      });
    }

    if (url.pathname === "/echo" && request.method === "POST") {
      const data = await request.json();
      return Response.json({
        received: data,
        status: "OK"
      });
    }

    return new Response("Not found", { status: 404 });
  }
};

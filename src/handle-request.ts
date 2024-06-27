// const pickHeaders = (headers: Headers, keys: (string | RegExp)[]): Headers => {
//   const picked = new Headers();
//   for (const key of headers.keys()) {
//     if (keys.some((k) => (typeof k === "string" ? k === key : k.test(key)))) {
//       const value = headers.get(key);
//       if (typeof value === "string") {
//         picked.set(key, value);
//       }
//     }
//   }
//   return picked;
// };

// const CORS_HEADERS: Record<string, string> = {
//   "access-control-allow-origin": "*",
//   "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "access-control-allow-headers": "Content-Type, Authorization",
// };

// export default async function handleRequest(req: Request & { nextUrl?: URL }) {
//   if (req.method === "OPTIONS") {
//     return new Response(null, {
//       headers: CORS_HEADERS,
//     });
//   }

//   const { pathname, search } = req.nextUrl ? req.nextUrl : new URL(req.url);
//   const url = new URL(pathname + search, "https://api.openai.com").href;
//   const headers = pickHeaders(req.headers, ["content-type", "authorization"]);

//   const res = await fetch(url, {
//     body: req.body,
//     method: req.method,
//     headers,
//   });

//   const resHeaders = {
//     ...CORS_HEADERS,
//     ...Object.fromEntries(
//       pickHeaders(res.headers, ["content-type", /^x-ratelimit-/, /^openai-/])
//     ),
//   };

//   return new Response(res.body, {
//     headers: resHeaders,
//     status: res.status
//   });
// }
const OPENAI_BASE_URL = "https://api.openai.com";
const EXAMPLE_API_BASE_URL = "https://api.ipify.org?format=json";

const pickHeaders = (headers: Headers, keys: (string | RegExp)[]): Headers => {
  const picked = new Headers();
  for (const key of headers.keys()) {
    if (keys.some((k) => (typeof k === "string" ? k === key : k.test(key)))) {
      const value = headers.get(key);
      if (typeof value === "string") {
        picked.set(key, value);
      }
    }
  }
  return picked;
};

const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization",
};

export default async function handleRequest(req: Request & { nextUrl?: URL }) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: CORS_HEADERS,
    });
  }

  const { pathname, search } = req.nextUrl ? req.nextUrl : new URL(req.url);
  
  let targetUrl: string;
  let headers: Headers;

  // Determine which API to route to based on the pathname
  if (pathname.startsWith("/openai/")) {
    targetUrl = new URL(pathname.replace("/openai", "") + search, OPENAI_BASE_URL).href;
    headers = pickHeaders(req.headers, ["content-type", "authorization"]);

    const res = await fetch(targetUrl, {
      body: req.body,
      method: req.method,
      headers,
    });

    const resHeaders = {
      ...CORS_HEADERS,
      ...Object.fromEntries(
        pickHeaders(res.headers, ["content-type", /^x-ratelimit-/, /^openai-/])
      ),
    };

    return new Response(res.body, {
      headers: resHeaders,
      status: res.status
    });
  } else if (pathname === "/get-ip") {
    try {
      const ipifyResponse = await fetch(IPIFY_API_URL);
      const ipData = await ipifyResponse.json();

      return new Response(JSON.stringify(ipData), {
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json"
        },
        status: 200
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch IP" }), {
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json"
        },
        status: 500
      });
    }
  } else {
    return new Response("Not Found", { status: 404 });
  }
}

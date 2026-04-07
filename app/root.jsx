import { Links, Meta, Outlet, Scripts } from "@remix-run/react";
import { addDocumentResponseHeaders } from "./shopify.server";

export const headers = (headersArgs) => {
  return addDocumentResponseHeaders(headersArgs);
};

export default function App() {
  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}

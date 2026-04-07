import { Outlet, useLoaderData, useLocation, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <div style={{ padding: "20px", background: "yellow" }}>
        <h1>APP LAYOUT IS WORKING</h1>
      </div>

      <Outlet />
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  const defaultHeaders = boundary.headers(headersArgs);

  return {
    ...defaultHeaders,
    "Content-Security-Policy":
      "frame-ancestors https://admin.shopify.com https://admin.shopify.com/store/trvlbuddy;",
  };
};

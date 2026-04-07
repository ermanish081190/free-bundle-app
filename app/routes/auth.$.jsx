import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request, {
    returnHeaders: true,
  });

  return null;
};

export const headers = (headersArgs) => {
  const headers = boundary.headers(headersArgs);

  return {
    ...headers,
    ...headersArgs.loaderHeaders, // 👈 REQUIRED for auth redirect
    "Content-Security-Policy":
      "frame-ancestors https://admin.shopify.com https://admin.shopify.com/store/trvlbuddy;",
  };
};

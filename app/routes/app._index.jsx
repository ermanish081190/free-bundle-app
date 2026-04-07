import { useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

// ✅ CLEAN LOADER (no discount creation)
export const loader = async ({ request }) => {
   const { admin } = await authenticate.admin(request);

  const query = `
  {
    shopifyFunctions(first: 10) {
      nodes {
        id
        title
        apiType
      }
    }
  }
  `;

  const res = await admin.graphql(query);
  const json = await res.json();

  console.log("DISCOUNT FUNCTIONS:", JSON.stringify(json, null, 2));

  return null;
};

// ✅ ACTION (runs when button is clicked)
export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  //const FUNCTION_ID = "019d6107-3295-7ae3-b398-bd3ca1bdd631";
  const FUNCTION_ID = "019d6958-5a3a-7ab0-8d6f-0dec55c2497a";
  const DISCOUNT_TITLE = "BUNDLE DISCOUNT";

  const mutation = `
    mutation {
      discountAutomaticAppCreate(
        automaticAppDiscount: {
          title: "${DISCOUNT_TITLE}"
          functionId: "${FUNCTION_ID}"
          startsAt: "${new Date().toISOString()}"
          discountClasses: [PRODUCT]
          combinesWith: {
            orderDiscounts: true
            productDiscounts: true
            shippingDiscounts: true
          }
        }
      ) {
        automaticAppDiscount {
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await admin.graphql(mutation);
  const json = await res.json();

  console.log("DISCOUNT RESPONSE:", JSON.stringify(json, null, 2));

  return { success: true };
};

// ✅ CLEAN UI (only button)
export default function Index() {
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state);

  return (
    <div style={{ padding: "20px" }}>
      <fetcher.Form method="post">
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Add bundle discount"}
        </button>
      </fetcher.Form>

      {fetcher.data?.success && (
        <p style={{ marginTop: "10px" }}>
          ✅ Discount created successfully
        </p>
      )}
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

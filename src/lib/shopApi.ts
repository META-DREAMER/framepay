import { gql } from "graphql-request";
import type {
  AttributeInput,
  CheckoutCreateInput,
  CheckoutLineItemInput,
  SelectedOptionInput,
} from "@shopify/hydrogen-react/storefront-api-types";

import { env } from "@/env.js";
import type {
  CreateCheckoutMutation,
  GetCheckoutQuery,
  GetProductDataQuery,
} from "@/lib/storefront-generated/storefront.generated";
import type * as StorefrontTypes from "@/lib/storefront-generated/storefront.types";
import { createStorefrontApiClient } from "@shopify/storefront-api-client";

const client = createStorefrontApiClient({
  storeDomain: env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  apiVersion: "2024-04",
  publicAccessToken: env.NEXT_PUBLIC_SHOPIFY_TOKEN,
});

export const getCheckout = async (checkoutId: string) => {
  const { data, errors } = await client.request<GetCheckoutQuery>(
    gql`
      query getCheckout($checkoutId: ID!) {
        node(id: $checkoutId) {
          id
          ... on Checkout {
            completedAt
            orderStatusUrl
          }
        }
      }
    `,
    { variables: { checkoutId } },
  );
  if (!data || errors) {
    throw new Error(
      `Failed to fetch checkout: ${errors?.message || "no data"}`,
    );
  }
  return data.node as Pick<
    StorefrontTypes.Checkout,
    "completedAt" | "orderStatusUrl" | "id"
  >;
};

export const getShopifyProductData = async (
  productId: string,
  selectedOptions?: SelectedOptionInput[],
) => {
  const { data, errors } = await client.request<GetProductDataQuery>(
    gql`
      query getShopifyProductData(
        $id: ID!
        $selectedOptions: [SelectedOptionInput!] = []
      ) {
        product(id: $id) {
          id
          title
          handle
          description
          featuredImage {
            url
            height
            width
          }
          options {
            name
            values
          }
          variantBySelectedOptions(
            selectedOptions: $selectedOptions
            caseInsensitiveMatch: true
            ignoreUnknownOptions: true
          ) {
            id
            title
            selectedOptions {
              value
              name
            }
            availableForSale
            image {
              url
              height
              width
            }
          }
        }
      }
    `,
    { variables: { id: productId, selectedOptions } },
  );

  if (!data || errors) {
    throw new Error(
      `Failed to fetch product data: ${errors?.message || "no data"}`,
    );
  }

  return data.product;
};

export const createCheckout = async ({
  lineItems,
  customAttributes,
}: {
  lineItems: CheckoutLineItemInput[];
  customAttributes: AttributeInput[];
}): Promise<CreateCheckoutMutation["checkoutCreate"]> => {
  const input = {
    lineItems,
    customAttributes,
    // customAttributes: [
    //   { key: "Ethereum Address", value: ethAddress },
    //   { key: "mintTxHash", value: mintTxHash },
    //   { key: 'farcasterFid', value: farcasterFid }
    // ],
  } satisfies CheckoutCreateInput;

  const { data, errors } = await client.request<CreateCheckoutMutation>(
    gql`
      mutation CreateCheckout($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
          checkout {
            id
            webUrl
            # Add other fields you expect in the response here
          }
          checkoutUserErrors {
            code
            field
            message
          }
        }
      }
    `,
    { variables: { input } },
  );

  if (!data?.checkoutCreate || errors) {
    throw new Error(
      `Failed to create checkout: ${errors?.message || "no data"}`,
    );
  }

  return data.checkoutCreate;
};

import { gql } from "graphql-request";
import { createAdminApiClient } from "@shopify/admin-api-client";

import { env } from "@/env.js";
import type {
  DropOrdersQuery,
  GetProductForVariantQuery,
} from "@/lib/admin-generated/admin.generated";

const adminClient = createAdminApiClient({
  storeDomain: env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  apiVersion: "2024-04",
  accessToken: env.SHOPIFY_ADMIN_TOKEN,
});

const dropOrdersQuery = gql`
  query dropOrders($after: String, $first: Int = 50) {
    orders(
      query: "tag:framepay-order"
      first: $first
      reverse: true
      after: $after
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        createdAt
        customAttributes {
          key
          value
        }
      }
    }
  }
`;

type OrderNode = DropOrdersQuery["orders"]["nodes"][0];

export const findOrderWithTxHash = (orders: OrderNode[], txHash: string) =>
  orders.find((o) =>
    o?.customAttributes.find(
      ({ value }) => value && value.toLowerCase() === txHash.toLowerCase(),
    ),
  );

export const getDropOrderForTxHash = async (
  txHash: string,
  after?: string,
): Promise<OrderNode | null> => {
  const { data, errors } = await adminClient.request<DropOrdersQuery>(
    dropOrdersQuery,
    {
      variables: {
        after,
      },
    },
  );
  if (!data || errors) {
    console.log("failed to get drop orders", errors);
    throw new Error(
      `Failed to fetch drop orders: ${errors?.message || "no data"}`,
    );
  }

  const existingOrder = findOrderWithTxHash(data.orders.nodes, txHash);

  if (existingOrder) {
    return existingOrder;
  }

  // paginate results in case order not yet found
  if (data.orders.pageInfo.hasNextPage && data.orders.pageInfo.endCursor) {
    return await getDropOrderForTxHash(
      txHash,
      data.orders.pageInfo.endCursor,
    );
  }

  return null;
};

export const getAllOnchainOrders = async (
  after?: string,
): Promise<DropOrdersQuery["orders"]["nodes"]> => {
  const { data, errors } = await adminClient.request<DropOrdersQuery>(
    dropOrdersQuery,
    {
      variables: { first: 250, after },
    },
  );

  if (!data || errors) {
    throw new Error(
      `Failed to fetch drop orders: ${errors?.message || "no data"}`,
    );
  }

  if (data.orders.pageInfo.hasNextPage && data.orders.pageInfo.endCursor) {
    return [
      ...data.orders.nodes,
      ...(await getAllOnchainOrders(data.orders.pageInfo.endCursor)),
    ];
  }

  return data.orders.nodes;
};

export const getProductForVariantId = async (variantId: string) => {
  const { data } = await adminClient.request<GetProductForVariantQuery>(
    gql`
      query GetProductForVariant($id: ID!) {
        productVariant(id: $id) {
          id
          title
          product {
            id
            title
          }
        }
      }
    `,
    { variables: { id: variantId } },
  );
  return data?.productVariant?.product;
};

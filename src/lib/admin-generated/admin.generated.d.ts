/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type DropOrdersQueryVariables = AdminTypes.Exact<{
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type DropOrdersQuery = { orders: { pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'endCursor'>, nodes: Array<(
      Pick<AdminTypes.Order, 'id' | 'createdAt'>
      & { lineItems: { nodes: Array<(
          Pick<AdminTypes.LineItem, 'name'>
          & { image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url'>> }
        )> }, customAttributes: Array<Pick<AdminTypes.Attribute, 'key' | 'value'>> }
    )> } };

export type GetProductForVariantQueryVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type GetProductForVariantQuery = { productVariant?: AdminTypes.Maybe<(
    Pick<AdminTypes.ProductVariant, 'id' | 'title'>
    & { product: Pick<AdminTypes.Product, 'id' | 'title'> }
  )> };

interface GeneratedQueryTypes {
  "\n  query dropOrders($after: String) {\n    orders(query: \"channel:headless\", first: 50, reverse: true, after: $after) {\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      nodes {\n        id\n        createdAt\n        lineItems(first: 10) {\n          nodes {\n            image {\n              url\n            }\n            name\n          }}\n        customAttributes {\n          key\n          value\n        } \n      }\n     \n    }\n  }\n": {return: DropOrdersQuery, variables: DropOrdersQueryVariables},
  "\n      query GetProductForVariant($id: ID!) {\n        productVariant(id: $id) {\n          id\n          title\n          product {\n            id\n            title\n          }\n        }\n      }\n    ": {return: GetProductForVariantQuery, variables: GetProductForVariantQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}

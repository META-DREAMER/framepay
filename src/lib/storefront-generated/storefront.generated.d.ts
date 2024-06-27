/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontTypes from './storefront.types';

export type GetCheckoutQueryVariables = StorefrontTypes.Exact<{
  checkoutId: StorefrontTypes.Scalars['ID']['input'];
}>;


export type GetCheckoutQuery = { node?: StorefrontTypes.Maybe<Pick<StorefrontTypes.AppliedGiftCard, 'id'> | Pick<StorefrontTypes.Article, 'id'> | Pick<StorefrontTypes.Blog, 'id'> | Pick<StorefrontTypes.Cart, 'id'> | Pick<StorefrontTypes.CartLine, 'id'> | Pick<StorefrontTypes.Checkout, 'completedAt' | 'orderStatusUrl' | 'id'> | Pick<StorefrontTypes.CheckoutLineItem, 'id'> | Pick<StorefrontTypes.Collection, 'id'> | Pick<StorefrontTypes.Comment, 'id'> | Pick<StorefrontTypes.Company, 'id'> | Pick<StorefrontTypes.CompanyContact, 'id'> | Pick<StorefrontTypes.CompanyLocation, 'id'> | Pick<StorefrontTypes.ComponentizableCartLine, 'id'> | Pick<StorefrontTypes.ExternalVideo, 'id'> | Pick<StorefrontTypes.GenericFile, 'id'> | Pick<StorefrontTypes.Location, 'id'> | Pick<StorefrontTypes.MailingAddress, 'id'> | Pick<StorefrontTypes.Market, 'id'> | Pick<StorefrontTypes.MediaImage, 'id'> | Pick<StorefrontTypes.MediaPresentation, 'id'> | Pick<StorefrontTypes.Menu, 'id'> | Pick<StorefrontTypes.MenuItem, 'id'> | Pick<StorefrontTypes.Metafield, 'id'> | Pick<StorefrontTypes.Metaobject, 'id'> | Pick<StorefrontTypes.Model3d, 'id'> | Pick<StorefrontTypes.Order, 'id'> | Pick<StorefrontTypes.Page, 'id'> | Pick<StorefrontTypes.Payment, 'id'> | Pick<StorefrontTypes.Product, 'id'> | Pick<StorefrontTypes.ProductOption, 'id'> | Pick<StorefrontTypes.ProductVariant, 'id'> | Pick<StorefrontTypes.Shop, 'id'> | Pick<StorefrontTypes.ShopPolicy, 'id'> | Pick<StorefrontTypes.UrlRedirect, 'id'> | Pick<StorefrontTypes.Video, 'id'>> };

export type GetProductDataQueryVariables = StorefrontTypes.Exact<{
  id: StorefrontTypes.Scalars['ID']['input'];
  selectedOptions?: StorefrontTypes.InputMaybe<Array<StorefrontTypes.SelectedOptionInput> | StorefrontTypes.SelectedOptionInput>;
}>;


export type GetProductDataQuery = { product?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'description'>
    & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'height' | 'width'>>, options: Array<Pick<StorefrontTypes.ProductOption, 'name' | 'values'>>, variantBySelectedOptions?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
      & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'value' | 'name'>>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'height' | 'width'>> }
    )> }
  )> };

export type GetVariantQueryVariables = StorefrontTypes.Exact<{
  id: StorefrontTypes.Scalars['ID']['input'];
}>;


export type GetVariantQuery = { product?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Product, 'id' | 'title'>
    & { variants: { edges: Array<{ node: (
          Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'sku'>
          & { priceV2: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
        ) }> } }
  )> };

export type CreateCheckoutMutationVariables = StorefrontTypes.Exact<{
  input: StorefrontTypes.CheckoutCreateInput;
}>;


export type CreateCheckoutMutation = { checkoutCreate?: StorefrontTypes.Maybe<{ checkout?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Checkout, 'id' | 'webUrl'>>, checkoutUserErrors: Array<Pick<StorefrontTypes.CheckoutUserError, 'code' | 'field' | 'message'>> }> };

interface GeneratedQueryTypes {
  "\n      query getCheckout($checkoutId: ID!) {\n        node(id: $checkoutId) {\n          id\n          ... on Checkout {\n            completedAt\n            orderStatusUrl\n          }\n        }\n      }\n    ": {return: GetCheckoutQuery, variables: GetCheckoutQueryVariables},
  "\n      query getProductData($id: ID!, $selectedOptions: [SelectedOptionInput!] = []) {\n        product(id: $id) {\n          id\n          title\n          handle\n          description\n          featuredImage {\n            url\n            height\n            width\n          }\n          options {\n            name\n            values\n          }\n          variantBySelectedOptions(selectedOptions: $selectedOptions, caseInsensitiveMatch: true) {\n            id\n            title\n            selectedOptions {\n              value\n              name\n            }\n            availableForSale\n            image {\n              url\n              height\n              width\n            }\n          }\n        }\n      }\n    ": {return: GetProductDataQuery, variables: GetProductDataQueryVariables},
  "\n      query GetVariant($id: ID!) {\n        product(id: $id) {\n          id\n          title\n          variants(first: 30) {\n            # Adjust the 'first' parameter as needed\n            edges {\n              node {\n                id\n                title\n                sku\n                priceV2 {\n                  amount\n                  currencyCode\n                }\n              }\n            }\n          }\n        }\n      }\n    ": {return: GetVariantQuery, variables: GetVariantQueryVariables},
}

interface GeneratedMutationTypes {
  "\n      mutation CreateCheckout($input: CheckoutCreateInput!) {\n        checkoutCreate(input: $input) {\n          checkout {\n            id\n            webUrl\n            # Add other fields you expect in the response here\n          }\n          checkoutUserErrors {\n            code\n            field\n            message\n          }\n        }\n      }\n    ": {return: CreateCheckoutMutation, variables: CreateCheckoutMutationVariables},
}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}

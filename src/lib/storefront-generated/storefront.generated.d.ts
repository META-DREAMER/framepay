/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontTypes from './storefront.types';

export type GetCheckoutQueryVariables = StorefrontTypes.Exact<{
  checkoutId: StorefrontTypes.Scalars['ID']['input'];
}>;


export type GetCheckoutQuery = { node?: StorefrontTypes.Maybe<Pick<StorefrontTypes.AppliedGiftCard, 'id'> | Pick<StorefrontTypes.Article, 'id'> | Pick<StorefrontTypes.Blog, 'id'> | Pick<StorefrontTypes.Cart, 'id'> | Pick<StorefrontTypes.CartLine, 'id'> | Pick<StorefrontTypes.Checkout, 'completedAt' | 'orderStatusUrl' | 'id'> | Pick<StorefrontTypes.CheckoutLineItem, 'id'> | Pick<StorefrontTypes.Collection, 'id'> | Pick<StorefrontTypes.Comment, 'id'> | Pick<StorefrontTypes.Company, 'id'> | Pick<StorefrontTypes.CompanyContact, 'id'> | Pick<StorefrontTypes.CompanyLocation, 'id'> | Pick<StorefrontTypes.ComponentizableCartLine, 'id'> | Pick<StorefrontTypes.ExternalVideo, 'id'> | Pick<StorefrontTypes.GenericFile, 'id'> | Pick<StorefrontTypes.Location, 'id'> | Pick<StorefrontTypes.MailingAddress, 'id'> | Pick<StorefrontTypes.Market, 'id'> | Pick<StorefrontTypes.MediaImage, 'id'> | Pick<StorefrontTypes.MediaPresentation, 'id'> | Pick<StorefrontTypes.Menu, 'id'> | Pick<StorefrontTypes.MenuItem, 'id'> | Pick<StorefrontTypes.Metafield, 'id'> | Pick<StorefrontTypes.Metaobject, 'id'> | Pick<StorefrontTypes.Model3d, 'id'> | Pick<StorefrontTypes.Order, 'id'> | Pick<StorefrontTypes.Page, 'id'> | Pick<StorefrontTypes.Payment, 'id'> | Pick<StorefrontTypes.Product, 'id'> | Pick<StorefrontTypes.ProductOption, 'id'> | Pick<StorefrontTypes.ProductVariant, 'id'> | Pick<StorefrontTypes.Shop, 'id'> | Pick<StorefrontTypes.ShopPolicy, 'id'> | Pick<StorefrontTypes.UrlRedirect, 'id'> | Pick<StorefrontTypes.Video, 'id'>> };

export type GetShopifyProductDataQueryVariables = StorefrontTypes.Exact<{
  id: StorefrontTypes.Scalars['ID']['input'];
  selectedOptions?: StorefrontTypes.InputMaybe<Array<StorefrontTypes.SelectedOptionInput> | StorefrontTypes.SelectedOptionInput>;
}>;


export type GetShopifyProductDataQuery = { product?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'description'>
    & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'height' | 'width'>>, options: Array<Pick<StorefrontTypes.ProductOption, 'name' | 'values'>>, variantBySelectedOptions?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
      & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'value' | 'name'>>, metafield?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'value'>>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'height' | 'width'>> }
    )> }
  )> };

export type CreateCheckoutMutationVariables = StorefrontTypes.Exact<{
  input: StorefrontTypes.CheckoutCreateInput;
}>;


export type CreateCheckoutMutation = { checkoutCreate?: StorefrontTypes.Maybe<{ checkout?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Checkout, 'id' | 'webUrl'>>, checkoutUserErrors: Array<Pick<StorefrontTypes.CheckoutUserError, 'code' | 'field' | 'message'>> }> };

interface GeneratedQueryTypes {
  "\n      query getCheckout($checkoutId: ID!) {\n        node(id: $checkoutId) {\n          id\n          ... on Checkout {\n            completedAt\n            orderStatusUrl\n          }\n        }\n      }\n    ": {return: GetCheckoutQuery, variables: GetCheckoutQueryVariables},
  "\n      query getShopifyProductData(\n        $id: ID!\n        $selectedOptions: [SelectedOptionInput!] = []\n      ) {\n        product(id: $id) {\n          id\n          title\n          handle\n          description\n          featuredImage {\n            url\n            height\n            width\n          }\n          options {\n            name\n            values\n          }\n          variantBySelectedOptions(\n            selectedOptions: $selectedOptions\n            caseInsensitiveMatch: true\n            ignoreUnknownOptions: true\n          ) {\n            id\n            title\n            selectedOptions {\n              value\n              name\n            }\n            availableForSale\n            metafield(namespace: \"custom\", key: \"bundled_products\") {\n              value\n            }\n            image {\n              url\n              height\n              width\n            }\n          }\n        }\n      }\n    ": {return: GetShopifyProductDataQuery, variables: GetShopifyProductDataQueryVariables},
}

interface GeneratedMutationTypes {
  "\n      mutation CreateCheckout($input: CheckoutCreateInput!) {\n        checkoutCreate(input: $input) {\n          checkout {\n            id\n            webUrl\n            # Add other fields you expect in the response here\n          }\n          checkoutUserErrors {\n            code\n            field\n            message\n          }\n        }\n      }\n    ": {return: CreateCheckoutMutation, variables: CreateCheckoutMutationVariables},
}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}

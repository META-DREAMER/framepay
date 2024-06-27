import {ApiType, shopifyApiProject} from '@shopify/api-codegen-preset';

export default {
  overwrite: true,
  schema: 'https://shopify.dev/admin-graphql-direct-proxy/2024-04',
  documents: ['./src/**/*.{js,ts,tsx,jsx}', '!node_modules'],
  projects: {
    default: shopifyApiProject({
      apiType: ApiType.Admin,
      apiVersion: '2024-04',
      documents: ["./src/lib/shopAdminApi.ts"],
      outputDir: "./src/lib/admin-generated",
    }),
    storefront: shopifyApiProject({
      apiType: ApiType.Storefront,
      apiVersion: "2024-04",
      documents: ["./src/lib/shopApi.ts"],
      outputDir: "./src/lib/storefront-generated",
    }),
  },
};

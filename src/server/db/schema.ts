// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { InferSelectModel } from "drizzle-orm";
import {
  text,
  numeric,
  integer,
  pgTableCreator,
  serial,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `onchain-checkout-frame_${name}`);

export const DropsTable = createTable(
  "drops",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    contractAddress: text("contractAddress").notNull(),
    tokenId: integer("tokenId"),
    chainId: integer("chainId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    startsAt: timestamp("startsAt").notNull(),
    endsAt: timestamp("endsAt").notNull(),
    ethPrice: numeric("ethPrice").notNull().default("0"),
  },
  (drops) => {
    return {
      contractTokenUnique: uniqueIndex('contract_token_unique').on(drops.contractAddress, drops.tokenId),
    };
  },
);


export const ShopifyProductsTable = createTable(
  "shopify_products",
  {
    id: serial("id").primaryKey(),
    shopifyProductId: text("shopifyProductId").notNull().unique(),
  },
);

// Drop Shopify Products Table (Many-to-Many Relationship)
export const DropShopifyProductsTable = createTable(
  "drops_shopify_products",
  {
    dropId: integer("dropId").notNull().references(() => DropsTable.id),
    shopifyProductId: integer("shopifyProductId").notNull().references(() => ShopifyProductsTable.id),
  },
  (dropShopifyProducts) => {
    return {
      dropShopifyProductUnique: uniqueIndex('drop_shopify_product_unique').on(dropShopifyProducts.dropId, dropShopifyProducts.shopifyProductId),
    };
  },
);

export type Drop = InferSelectModel<typeof DropsTable>;
export type ShopifyProduct = InferSelectModel<typeof ShopifyProductsTable>;
export type DropShopifyProduct = InferSelectModel<typeof DropShopifyProductsTable>;


export const CheckoutsTable = createTable(
  "checkouts",
  {
    shopifyCheckoutId: text("shopifyCheckoutId").primaryKey(),
    url: text("url").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    transactionHash: text("transactionHash").notNull(),
    walletAddress: text('walletAddress').notNull(),
    dropId: integer("dropId").references(() => DropsTable.id).notNull(),
    farcasterFid: text("farcasterFid"),
  },
  (checkouts) => {
    return {
      uniqueIdx: uniqueIndex("checkout_tx_hash_idx").on(
        checkouts.transactionHash,
      ),
    };
  },
);
export type Checkout = InferSelectModel<typeof CheckoutsTable>;

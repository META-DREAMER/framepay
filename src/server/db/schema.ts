// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { type InferSelectModel, relations } from "drizzle-orm";
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
export const createTable = pgTableCreator(
  (name) => `onchain-checkout-frame_${name}`,
);

export const DropsTable = createTable(
  "drops",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    contractAddress: text("contractAddress").notNull(),
    tokenId: integer("tokenId"),
    chainId: integer("chainId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    shopifyProductId: text("shopifyProductId").notNull(),
    startsAt: timestamp("startsAt"),
    endsAt: timestamp("endsAt"),
    ethPrice: numeric("ethPrice").notNull().default("0"),
  },
  (drops) => {
    return {
      contractTokenUnique: uniqueIndex("contract_token_unique").on(
        drops.contractAddress,
        drops.tokenId,
      ),
    };
  },
);

export const dropsRelations = relations(DropsTable, ({ many }) => ({
  products: many(DropBundledProducts),
}));

// Drop Shopify Products Table (One-to-Many Relationship)
export const DropBundledProducts = createTable(
  "drop_bundled_products",
  {
    dropId: integer("dropId")
      .notNull()
      .references(() => DropsTable.id),
    bundledShopifyProductId: text("bundledShopifyProductId").notNull(),
  },
  (dropShopifyProducts) => {
    return {
      dropBundledProductUnique: uniqueIndex("drop_bundled_product_unique").on(
        dropShopifyProducts.dropId,
        dropShopifyProducts.bundledShopifyProductId,
      ),
    };
  },
);

export const dropProductsRelations = relations(
  DropBundledProducts,
  ({ one }) => ({
    drop: one(DropsTable, {
      fields: [DropBundledProducts.dropId],
      references: [DropsTable.id],
    }),
  }),
);

export type Drop = InferSelectModel<typeof DropsTable>;
export type DropProduct = InferSelectModel<typeof DropBundledProducts>;

export const CheckoutsTable = createTable(
  "checkouts",
  {
    shopifyCheckoutId: text("shopifyCheckoutId").primaryKey(),
    url: text("url").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    transactionHash: text("transactionHash").notNull(),
    walletAddress: text("walletAddress").notNull(),
    dropId: integer("dropId")
      .references(() => DropsTable.id)
      .notNull(),
    farcasterFid: integer("farcasterFid"),
  },
  (checkouts) => {
    return {
      uniqueIdx: uniqueIndex("checkout_tx_hash_idx").on(
        checkouts.transactionHash,
      ),
    };
  },
);
export type CheckoutData = InferSelectModel<typeof CheckoutsTable>;

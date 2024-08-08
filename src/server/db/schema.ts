// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { type InferSelectModel } from "drizzle-orm";
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
export const createTable = pgTableCreator((name) => `framepay_${name}`);

export const DropsTable = createTable(
  "drops",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    contractAddress: text("contractAddress").notNull(),
    tokenId: integer("tokenId").notNull(),
    chainId: integer("chainId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    shopifyProductId: text("shopifyProductId").notNull(),
    startsAt: timestamp("startsAt"),
    endsAt: timestamp("endsAt"),
    ethPrice: numeric("ethPrice").notNull().default("0"),
  },
  (drops) => {
    return {
      contractTokenUnique: uniqueIndex("fp_contract_token_unique").on(
        drops.contractAddress,
        drops.tokenId,
      ),
    };
  },
);

export type Drop = InferSelectModel<typeof DropsTable>;

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
      uniqueIdx: uniqueIndex("fp_checkout_tx_hash_idx").on(
        checkouts.transactionHash,
      ),
    };
  },
);
export type CheckoutData = InferSelectModel<typeof CheckoutsTable>;

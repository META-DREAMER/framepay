import { env } from "@/env.js";
import { createPublicClient, http } from 'viem'
import { base, baseSepolia } from 'viem/chains';

export const ACTIVE_CHAIN =
  env.NEXT_PUBLIC_ACTIVE_CHAIN === "base" ? base : baseSepolia;

const CHAIN_RPC = env.NEXT_PUBLIC_ACTIVE_CHAIN === "base"
    ? env.NEXT_PUBLIC_BASE_RPC
    : env.NEXT_PUBLIC_TESTNET_RPC;


export const publicViemClient = createPublicClient({
  batch: {
    multicall: true,
  },
  chain: ACTIVE_CHAIN,
  transport: http(CHAIN_RPC),
})

export const ACTIVE_CHAIN_ID = ACTIVE_CHAIN.id;


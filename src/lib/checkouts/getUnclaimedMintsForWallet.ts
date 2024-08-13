import "server-only";
import { db } from "@/server/db";
import { getAllOnchainOrders } from "@/lib/shopAdminApi";
import { publicViemClient } from "@/lib/viemClient";
import { StoreManagerABI } from "@/app/_contracts/StoreManager";

export const getUnclaimedMintsForWallet = async (
  dropId: number,
  walletAddress: `0x${string}`,
) => {
  const dropData = await db.query.DropsTable.findFirst({
    where: (drops, { eq }) => eq(drops.id, dropId),
    columns: {
      contractAddress: true,
    },
  });
  if (!dropData) {
    throw new Error("Drop not found");
  }

  const mintEvents = await publicViemClient.getContractEvents({
    address: dropData.contractAddress as `0x${string}`,
    abi: StoreManagerABI,
    eventName: "Minted",
    args: { account: walletAddress },
    fromBlock: "earliest",
  });
  if (!mintEvents.length) {
    return [];
  }
  const mintTxHashes = mintEvents.map((e) => e.transactionHash);
  const allOrders = await getAllOnchainOrders();

  return mintTxHashes.filter(
    (txHash) =>
      !allOrders.some((o) =>
        o?.customAttributes.find(
          ({ value }) => value?.toLowerCase() === txHash.toLowerCase(),
        ),
      ),
  );
};

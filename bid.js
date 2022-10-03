import auctioneer, {
  createSellInstruction,
  createBuyInstruction,
} from "@metaplex-foundation/mpl-auctioneer";
import { createDelegateAuctioneerInstruction } from "@metaplex-foundation/mpl-auction-house";

import pack from "@solana/web3.js";
const { Connection, clusterApiUrl, Keypair, PublicKey, web3, Transaction } =
  pack;
import * as anchor from "@project-serum/anchor";
import pkggg from "@project-serum/anchor";
const { Provider } = pkggg;
import pkkk from "@project-serum/anchor";
const { BN } = pkkk;
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  getMint,
} from "@solana/spl-token";
import {
  TOKEN_METADATA_PROGRAM_ID,
  WRAPPED_SOL_MINT,
  AUCTION_HOUSE_PROGRAM_ID,
  AUCTIONEER,
  SELLERKEY,
  BUYERKEY,
  MINT,
  AH,
} from "./constants.js";
import dotenv from "dotenv";
dotenv.config();

async function by() {
  const sellerKey = SELLERKEY;

  const buyerKey = BUYERKEY

  const connection = new Connection(clusterApiUrl("devnet"));
  const mint = new PublicKey(MINT);
  const aH = new PublicKey(AH);
  const seller = Keypair.fromSecretKey(Uint8Array.from(sellerKey));
  const buyer = Keypair.fromSecretKey(Uint8Array.from(buyerKey));

  const auctioneerAuthority = await PublicKey.findProgramAddress(
    [Buffer.from("auctioneer"), aH.toBuffer()],
    AUCTIONEER
  );

  const pda = await PublicKey.findProgramAddress(
    [
      Buffer.from("auctioneer"),
      aH.toBuffer(),
      auctioneerAuthority[0].toBuffer(),
    ],
    AUCTION_HOUSE_PROGRAM_ID
  );

  const associatedAddress = await getAssociatedTokenAddress(
    mint,
    seller.publicKey
  );

  const listingConfig = await PublicKey.findProgramAddress(
    [
      Buffer.from("listing_config"),
      seller.publicKey.toBuffer(),
      aH.toBuffer(),
      associatedAddress.toBuffer(),
      WRAPPED_SOL_MINT.toBuffer(),
      mint.toBuffer(),
      new BN(1).toBuffer("le", 8),
    ],
    AUCTIONEER
  );

  const metadata = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const escrowPaymentAccount = await PublicKey.findProgramAddress(
    [Buffer.from("auction_house"), aH.toBuffer(), buyer.publicKey.toBuffer()],
    AUCTION_HOUSE_PROGRAM_ID
  );
  const buyerTradeState = await PublicKey.findProgramAddress(
    [
      Buffer.from("auction_house"),
      buyer.publicKey.toBuffer(),
      aH.toBuffer(),
      associatedAddress.toBuffer(),
      WRAPPED_SOL_MINT.toBuffer(),
      mint.toBuffer(),
      new BN(1000000000).toArrayLike(Buffer, "le", 8),
      new BN(1).toArrayLike(Buffer, "le", 8),
    ],
    AUCTION_HOUSE_PROGRAM_ID
  );

  const auctionHouseFeeAccount = await PublicKey.findProgramAddress(
    [
      Buffer.from("auction_house"),
      aH.toBuffer(),
      Buffer.from("fee_payer"),
    ],
    AUCTION_HOUSE_PROGRAM_ID
  );

 

  const buyArgs = {
    tradeStateBump: buyerTradeState[1],
    escrowPaymentBump: escrowPaymentAccount[1],
    auctioneerAuthorityBump: auctioneerAuthority[1],
    buyerPrice: 1000000000,
    tokenSize: 1,
  };

  const buyAccounts = {
    auctionHouseProgram: AUCTION_HOUSE_PROGRAM_ID,
    listingConfig: listingConfig[0],
    seller: seller.publicKey,
    wallet: buyer.publicKey,
    paymentAccount: buyer.publicKey,
    transferAuthority: seller.publicKey,
    treasuryMint: WRAPPED_SOL_MINT,
    tokenAccount: associatedAddress,
    metadata: metadata[0],
    escrowPaymentAccount: escrowPaymentAccount[0],
    authority: new PublicKey("2aPCrU8erdc7ZTQo3A1sZd3qpzzZ8FSQmyk8mij6Wgwb"),
    auctionHouse: aH,
    auctionHouseFeeAccount: auctionHouseFeeAccount[0],
    buyerTradeState: buyerTradeState[0],
    auctioneerAuthority: auctioneerAuthority[0],
    ahAuctioneerPda: pda[0],
  };

  const buy = await auctioneer.createBuyInstruction(buyAccounts, buyArgs);

  let tx = new Transaction();
  tx.add(buy);
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = buyer.publicKey;
  await tx.sign(buyer);
  const signature = await connection.sendRawTransaction(tx.serialize());

  const Transact = await connection.confirmTransaction(signature, "confirmed");

  console.log(Transact);
}

by();

import pack from "@solana/web3.js";
const {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  web3,
  Transaction,
  getCluster,
} = pack;
import auctioneer from "@metaplex-foundation/mpl-auctioneer";
import * as anchor from "@project-serum/anchor";
import pkggg from "@project-serum/anchor";
const { Provider } = pkggg;
import pkkk from "@project-serum/anchor";
import {
  TOKEN_METADATA_PROGRAM_ID,
  WRAPPED_SOL_MINT,
  AUCTION_HOUSE_PROGRAM_ID,
  AUCTIONEER,
  SELLERKEY,
  MINT,
  AH,
} from "./constants.js";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";

// const key = fs.readFileSync(
//   "./seller.json",
//   "utf8"
// );
//   const keypair = anchor.web3.Keypair.fromSecretKey(
//     Buffer.from(JSON.parse(key))
//   );
// const wallet = new anchor.Wallet(keypair);
const wallet = Keypair.fromSecretKey(Uint8Array.from(SELLERKEY));
const aH = AH;
const publicKey = wallet.publicKey;
console.log(publicKey.toBase58());

const auctioneerAuthority = await PublicKey.findProgramAddress(
  [Buffer.from("auctioneer"), aH.toBuffer()],
  AUCTIONEER
);

const connection = new anchor.web3.Connection("https://api.devnet.solana.com");

const authorizeKeys = {
  wallet: publicKey,
  auctionHouse: aH,
  auctioneerAuthority: auctioneerAuthority[0],
};

const authorizeIns = await auctioneer.createAuthorizeInstruction(authorizeKeys);

let ix = new Transaction();
ix.add(authorizeIns);
ix.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
ix.feePayer = publicKey;

ix.sign(wallet);

const sign = await connection.sendRawTransaction(ix.serialize());

await connection.confirmTransaction(sign, "confirmed");
console.log(sign);

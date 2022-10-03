import { createCreateAuctionHouseInstruction } from "@metaplex-foundation/mpl-auction-house";
import {
  SELLERKEY,
  WRAPPED_SOL_MINT,
  AUCTION_HOUSE_PROGRAM_ID,
} from "./constants.js";
import pack from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
const { Connection, clusterApiUrl, Keypair, PublicKey, web3, Transaction } =
  pack;

const connection = new Connection(clusterApiUrl("devnet"));

const sellerFeeBasisPoints = 1000;

const wallet = Keypair.fromSecretKey(Uint8Array.from(SELLERKEY));

const treasuryWithdrawalDestination = wallet.publicKey;

const feeWithdrawalDestination = wallet.publicKey;

const treasuryMint = WRAPPED_SOL_MINT;

const twdAta = await getAssociatedTokenAddress(treasuryMint, wallet.publicKey);

const [auctionHouse, ahBump] = await PublicKey.findProgramAddress(
  [
    Buffer.from("auction_house"),
    wallet.publicKey.toBuffer(),
    treasuryMint.toBuffer(),
  ],
  AUCTION_HOUSE_PROGRAM_ID
);

const [feeAccount, feeBump] = await PublicKey.findProgramAddress(
  [
    Buffer.from("auction_house"),
    auctionHouse.toBuffer(),
    Buffer.from("fee_payer"),
  ],
  AUCTION_HOUSE_PROGRAM_ID
);

const [treasuryAccount, treasuryBump] = await PublicKey.findProgramAddress(
  [
    Buffer.from("auction_house"),
    auctionHouse.toBuffer(),
    Buffer.from("treasury"),
  ],
  AUCTION_HOUSE_PROGRAM_ID
);

const accounts = {
  treasuryMint: treasuryMint,
  payer: wallet.publicKey,
  authority: wallet.publicKey,
  feeWithdrawalDestination: feeWithdrawalDestination,
  treasuryWithdrawalDestination: treasuryWithdrawalDestination,
  treasuryWithdrawalDestinationOwner: wallet.publicKey,
  auctionHouse: auctionHouse,
  auctionHouseFeeAccount: feeAccount,
  auctionHouseTreasury: treasuryAccount,
};

const args = {
  bump: ahBump,
  feePayerBump: feeBump,
  treasuryBump: treasuryBump,
  sellerFeeBasisPoints: sellerFeeBasisPoints,
  requiresSignOff: false,
  canChangeSalePrice: false,
};

const AH =  createCreateAuctionHouseInstruction(accounts, args);

let ix = new Transaction();
ix.add(AH);
ix.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
ix.feePayer = wallet.publicKey;

ix.sign(wallet);

const sign = await connection.sendRawTransaction(ix.serialize());

const tra = await connection.confirmTransaction(sign, "confirmed");
console.log(tra);

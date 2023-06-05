import auctioneer, {
  createSellInstruction,
} from "@metaplex-foundation/mpl-auctioneer";
import pack from "@solana/web3.js";
const { Connection, clusterApiUrl, Keypair, PublicKey, Transaction } = pack;
import * as anchor from "@project-serum/anchor";
import pkg from "@project-serum/anchor";
const { BN } = pkg;
import { getAssociatedTokenAddress } from "@solana/spl-token";
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

async function sell() {
  const key = SELLERKEY;

  const connection = new Connection(clusterApiUrl("devnet"));
  const wallet = Keypair.fromSecretKey(await Uint8Array.from(key));
  const mint = MINT;
  const aH = AH;
  const publicKey = wallet.publicKey;

  const [auctioneerAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from("auctioneer"), aH.toBuffer()],
    AUCTIONEER
  );

  const pda = await PublicKey.findProgramAddress(
    [Buffer.from("auctioneer"), aH.toBuffer(), auctioneerAuthority.toBuffer()],
    AUCTION_HOUSE_PROGRAM_ID
  );

  const associatedAddress = await getAssociatedTokenAddress(mint, publicKey);

  const listingConfig = await PublicKey.findProgramAddress(
    [
      Buffer.from("listing_config"),
      publicKey.toBuffer(),
      aH.toBuffer(),
      associatedAddress.toBuffer(),
      WRAPPED_SOL_MINT.toBuffer(),
      mint.toBuffer(),
      new BN(1).toBuffer("le", 8),
    ],
    AUCTIONEER
  );

  async function getAuctionHouseTradeState(
    auctionHouse,
    wallet,
    tokenAccount,
    treasuryMint,
    tokenMint,
    tokenSize,
    buyPrice
  ) {
    return await PublicKey.findProgramAddress(
      [
        Buffer.from("auction_house"),
        wallet.toBuffer(),
        auctionHouse.toBuffer(),
        tokenAccount.toBuffer(),
        treasuryMint.toBuffer(),
        tokenMint.toBuffer(),
        new BN(buyPrice).toArrayLike(Buffer, "le", 8),
        new BN(tokenSize).toArrayLike(Buffer, "le", 8),
      ],
      AUCTION_HOUSE_PROGRAM_ID
    );
  }

  const [sellerTradeState, tradeBump] = await getAuctionHouseTradeState(
    aH,
    publicKey,
    associatedAddress,
    WRAPPED_SOL_MINT,
    mint,
    1,
    "18446744073709551615"
  );

  const [freeTradeState, freeTradeBump] = await getAuctionHouseTradeState(
    aH,
    publicKey,
    associatedAddress,
    WRAPPED_SOL_MINT,
    mint,
    1,
    "0"
  );

  const feePayer = await PublicKey.findProgramAddress(
    [Buffer.from("auction_house"), aH.toBuffer(), Buffer.from("fee_payer")],
    AUCTION_HOUSE_PROGRAM_ID
  );

  const metadata = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const [signer, signerBump] = await PublicKey.findProgramAddress(
    [Buffer.from("auction_house"), Buffer.from("signer")],
    AUCTION_HOUSE_PROGRAM_ID
  );
  console.log(signer.toBase58());

  const accounts = {
    auctionHouseProgram: AUCTION_HOUSE_PROGRAM_ID,
    listingConfig: listingConfig[0],
    wallet: publicKey,
    tokenAccount: associatedAddress,
    metadata: metadata[0],
    authority: publicKey,
    auctionHouse: aH,
    auctionHouseFeeAccount: feePayer[0],
    sellerTradeState: sellerTradeState,
    freeSellerTradeState: freeTradeState,
    auctioneerAuthority: auctioneerAuthority,
    ahAuctioneerPda: pda[0],
    programAsSigner: signer,
  };

  const args = {
    tradeStateBump: tradeBump,
    freeTradeStateBump: freeTradeBump,
    programAsSignerBump: signerBump,
    auctioneerAuthorityBump: bump,
    tokenSize: new BN(Math.ceil(1 * 1)),
    startTime: 1664795111,
    endTime: 1664795999,
    reservePrice: 1,
    minBidIncrement: 1,
    timeExtPeriod: 1,
    timeExtDelta: 1,
    allowHighBidCancel: true,
  };

  const sellInstruction = await createSellInstruction(accounts, args);

  let tx = new Transaction();
  tx.add(sellInstruction);
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = wallet.publicKey;
  tx.sign(wallet);
  const signature = await connection.sendRawTransaction(tx.serialize());

  await connection.confirmTransaction(signature, "confirmed");

  console.log(signature);
}

sell();

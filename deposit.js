import auctioneer, { AUCTIONEER_PREFIX } from "@metaplex-foundation/mpl-auctioneer";
import pack from "@solana/web3.js"
const {Connection,clusterApiUrl,Keypair,PublicKey, web3,Transaction,getCluster} = pack
import * as anchor from '@project-serum/anchor';
import pkggg from '@project-serum/anchor';
const {Provider} = pkggg;
import pkkk from "@project-serum/anchor";
const { BN } = pkkk;
import {ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress ,TOKEN_PROGRAM_ID, getMint} from "@solana/spl-token";
import pkgg,{ Metadata }from "@metaplex-foundation/mpl-token-metadata"
import {TOKEN_METADATA_PROGRAM_ID,WRAPPED_SOL_MINT,AUCTION_HOUSE_PROGRAM_ID,AUCTIONEER,SELLERKEY,AH,MINT} from "./constants.js";
import dotenv from "dotenv";
import fs from "fs"
dotenv.config();

async function by() {

  const key = fs.readFileSync(
    "./seller.json",
    "utf8"
  );
    const keypair = anchor.web3.Keypair.fromSecretKey(
      Buffer.from(JSON.parse(key))
    );
    const wallet = new anchor.Wallet(keypair);
    const connection = new Connection(clusterApiUrl("devnet"));
    // const wallet =  Keypair.fromSecretKey( Uint8Array.from(keyPair));
    const mint = MINT
    const aH = AH
    const publicKey = wallet.publicKey
    const options = anchor.AnchorProvider.defaultOptions();

    const provider = new anchor.AnchorProvider(connection, wallet, options);


    const idl = await anchor.Program.fetchIdl(
      AUCTIONEER,
      provider,
    );

    
  
    const program = new anchor.Program(
      idl,
      AUCTIONEER,
      provider,
    );
    // console.log(idl.instructions[2])



    const auctioneerAuthority =  await PublicKey.findProgramAddress([Buffer.from('auctioneer'),
                                                            aH.toBuffer()]
                                                            ,AUCTIONEER);
                                                            
    // console.log(auctioneerAuthority[0].toBase58())

    const pda =  await PublicKey.findProgramAddress(
                                                     [ Buffer.from(AUCTIONEER_PREFIX),
                                                      aH.toBuffer(),
                                                      auctioneerAuthority[0].toBuffer()
                                                    ],
                                                    AUCTION_HOUSE_PROGRAM_ID
                                                    );
      console.log(pda[0].toBase58())

    const feePayer = await PublicKey.findProgramAddress([
                            Buffer.from('auction_house'),
                                aH.toBuffer(),
                                Buffer.from('fee_payer'),
                            ],AUCTION_HOUSE_PROGRAM_ID);
    const [escrowPaymentAccount, escrowPaymentBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from('auction_house'),
          aH.toBuffer(),
          publicKey.toBuffer(),
        ],
        AUCTION_HOUSE_PROGRAM_ID
      )

const depositArgs = {
    escrowPaymentBump: escrowPaymentBump,
    auctioneerAuthorityBump: auctioneerAuthority[1],
    amount: 1000000
  }
  
  const depositAccounts = {
    auctionHouseProgram: AUCTION_HOUSE_PROGRAM_ID,
    wallet: publicKey,
    paymentAccount: publicKey,
    transferAuthority: publicKey,
    escrowPaymentAccount: escrowPaymentAccount,
    treasuryMint: WRAPPED_SOL_MINT,
    authority: wallet.publicKey,
    auctionHouse: aH,
    auctionHouseFeeAccount: feePayer[0],
    auctioneerAuthority: auctioneerAuthority[0],
    ahAuctioneerPda: pda[0]
  }
  
  // const deposit = await auctioneer.createDepositInstruction(depositAccounts,depositArgs)

  const tra = await program.methods.deposit({AUCTION_HOUSE_PROGRAM_ID}).rpc()

  console.log(tra)
 

}by();
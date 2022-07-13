import auctioneer, { createSellInstruction } from "@metaplex-foundation/mpl-auctioneer";
import { ListingConfig} from "@metaplex-foundation/mpl-auctioneer";
import pkg,{ ListingConfigVersion, AuctioneerAuthority} from "@metaplex-foundation/mpl-auctioneer";
import {createDelegateAuctioneerInstruction} from "@metaplex-foundation/mpl-auction-house"
const {AuctioneerAuthorityArgs} =pkg;
import pack from "@solana/web3.js"
const {Connection,clusterApiUrl,Keypair,PublicKey, web3,Transaction} = pack
import * as anchor from '@project-serum/anchor';
import pkggg from '@project-serum/anchor';
const {Provider} = pkggg;
import pkkk from "@project-serum/anchor";
const { BN } = pkkk;
import {ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress ,TOKEN_PROGRAM_ID, getMint} from "@solana/spl-token";
import pkgg,{ Metadata }from "@metaplex-foundation/mpl-token-metadata"


async function by(){
  
const key = [201,127,6,149,29,164,83,181,23,2,115,92,244,206,178,80,20,119,95,3,204,246,101,39,167,170,218,241,99,212,157,182,143,90,61,168,156,64,146,244,233,199,175,141,157,82,105,239,106,66,192,46,179,146,240,230,249,137,89,255,64,139,2,139]
  // const key = [51,2,34,195,173,249,234,30,34,12,67,162,12,127,33,117,228,99,104,60,105,105,181,163,158,216,91,223,183,97,176,20,49,116,67,172,8,62,193,104,116,116,93,44,37,69,192,52,244,218,171,128,127,107,188,46,106,189,22,24,50,46,218,166]
    const connection = new Connection(clusterApiUrl("devnet"));
    const wallet =  Keypair.fromSecretKey(await Uint8Array.from(key));
    // const mint = new PublicKey("3ay5NzcEVuVCfPzfjcnRiaYv8KbYNFEPuBGBJ3Mp4Y5u")
    const mint = new PublicKey("5pYtBVsRJrfztmA5FqNw5AL1o2RH48Bhfc7qKMEmcifP")
    const aH = new PublicKey("BnHNmwRwMHpjq9LBkvQYTkMGRAY4yuWcT5nnGhVq4SBr")

    const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
    );

    const WRAPPED_SOL_MINT = new PublicKey(
'So11111111111111111111111111111111111111112',
);
   
    const AUCTION_HOUSE_PROGRAM_ID = new PublicKey(
      'hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk',
    );
    
      const publicKey = wallet.publicKey

      
      const AUCTIONEER = new PublicKey("neer8g6yJq2mQM6KbnViEDAD4gr3gRZyMMf4F2p3MEh")
      const auctioneerAuthority =  await PublicKey.findProgramAddress([Buffer.from('auctioneer'),
                                                            aH.toBuffer()]
                                                            ,AUCTIONEER);
     
      const pda =  await PublicKey.findProgramAddress(
                                                  [ Buffer.from('auctioneer'),
                                                    aH.toBuffer(),
                                                    auctioneerAuthority[0].toBuffer()
                                                  ],
                                                  AUCTION_HOUSE_PROGRAM_ID
                                                  );

                                              
// Authorize auctioneer
      //  const authorizeKeys = {
      //   wallet: publicKey,
      //   auctionHouse: aH,
      //   auctioneerAuthority: auctioneerAuthority[0],
      // }

      // const authorizeIns = await auctioneer.createAuthorizeInstruction(authorizeKeys);

      // let ix = new Transaction();
      // ix.add(authorizeIns);
      // ix.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
      // ix.feePayer = publicKey
      // await ix.sign(wallet);

      // const sign = await connection.sendRawTransaction(ix.serialize());

      // const tra = await connection.confirmTransaction(sign, 'confirmed');
      // console.log(tra);

      let delegateIns = {
          auctionHouse: aH,
          authority: publicKey,
          auctioneerAuthority: auctioneerAuthority[0],
          ahAuctioneerPda: pda[0]
      }
      let scope = {
        scopes :[0,1,2,3,4,5,6]
      }

      //Delegate Auctioneer
      const delegateAuctioneer = await createDelegateAuctioneerInstruction(delegateIns,scope)
      

      // let tx = new Transaction();
      // tx.add(delegateAuctioneer);
      // tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
      //  tx.feePayer = publicKey
      //   await tx.sign(wallet);
      // const signature = await connection.sendRawTransaction(tx.serialize());

      // const Transact = await connection.confirmTransaction(signature, 'confirmed');

      // console.log(Transact);
       

      
    //Auctioneer sell
      
    
  // const listingConfig =  await ListingConfig.fromArgs(configArgs);
  // console.log(publicKey.toBase58())
  const associatedAddress = await getAssociatedTokenAddress(
    mint,
    publicKey
  );

    // console.log(associatedAddress.toBase58())
    // console.log(mint.toBase58())
    // console.log(publicKey.toBase58());

    const listingConfig = await PublicKey.findProgramAddress(
      [ Buffer.from("listing_config"),
      publicKey.toBuffer(),
      aH.toBuffer(),
      associatedAddress.toBuffer(),
      WRAPPED_SOL_MINT.toBuffer(),
      mint.toBuffer(),
      new BN(1).toBuffer('le',8)
    ],
    AUCTIONEER
  )
  //  const tK =  (await connection.getLargestAccounts(mint)).value[0].address
  //  console.log(tK.toBase58(),associatedAddress.toBase58())

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
        Buffer.from('auction_house'), 
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
  console.log("sell",sellerTradeState.toBase58())

  // const sellerTradeState = await  anchor.web3.PublicKey.findProgramAddress(
  //   [
  //     Buffer.from('au'),
  //     publicKey.toBuffer(),
  //     aH.toBuffer(),
  //     associatedAddress.toBuffer(),
  //     WRAPPED_SOL_MINT.toBuffer(),
  //     mint.toBuffer(),
  //     new BN('18446744073709551615').toArrayLike(Buffer, "le", 8), 
  //     new BN(1).toArrayLike(Buffer, "le", 8), 
  //     // new BN('18446744073709551615').toBuffer('le',8),
  //     // new BN(1).toBuffer('le',8),
      
  //   ],
  //   AUCTION_HOUSE_PROGRAM_ID,
  // );
  // console.log(sellerTradeState[0].toBase58())
  const [freeTradeState, freeTradeBump] = await getAuctionHouseTradeState( 
    aH, 
    publicKey, 
    associatedAddress, 
    WRAPPED_SOL_MINT, 
    mint, 
    1, 
    "0" 
  );

  // const [freeTradeState, freeTradeBump] = await anchor.web3.PublicKey.findProgramAddress(
  //   [
  //     Buffer.from('auctioneer'),
  //     wallet.publicKey.toBuffer(),
  //     aH.toBuffer(),
  //     associatedAddress.toBuffer(),
  //     WRAPPED_SOL_MINT.toBuffer(),
  //     mint.toBuffer(),
  //     new BN (1).toBuffer('le',8),
  //     new BN (10000000).toBuffer('le',8),
  //   ],
  //   AUCTION_HOUSE_PROGRAM_ID,
  // );
  // console.log(freeTradeState.toBase58(),freeTradeBump)

  const feePayer = await PublicKey.findProgramAddress([
    Buffer.from('auction_house'),
    aH.toBuffer(),
    Buffer.from('fee_payer'),
  ],AUCTION_HOUSE_PROGRAM_ID);

  console.log(feePayer[0].toBase58());
  const metadata = await anchor.web3.PublicKey.findProgramAddress([
    Buffer.from('metadata'),
    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    mint.toBuffer(),
  ],
  TOKEN_METADATA_PROGRAM_ID,)
  console.log(metadata[0].toBase58());
  
  
      const [signer,signerBump] = await PublicKey.findProgramAddress([Buffer.from('auction_house'), Buffer.from('signer')],
      AUCTION_HOUSE_PROGRAM_ID);

  console.log(signer.toBase58(),signerBump)
    const accounts =  {
    auctionHouseProgram: AUCTION_HOUSE_PROGRAM_ID,
    listingConfig: listingConfig[0],
    wallet: publicKey,
    tokenAccount: associatedAddress,
    metadata: metadata[0],
    authority: new PublicKey("4L3oWp4ANModX1TspSSetKsB8HUu2TiBpuqj5FGJonAh"),
    auctionHouse: aH,
    auctionHouseFeeAccount: feePayer[0],
    sellerTradeState: sellerTradeState,
    freeSellerTradeState: freeTradeState,
    auctioneerAuthority: auctioneerAuthority[0],
    ahAuctioneerPda: pda[0],
    programAsSigner: signer,
    }

// console.log(accounts)
    const auctioneerAuthorityBump = await auctioneer.AuctioneerAuthority.fromAccountAddress(connection,auctioneerAuthority[0])

    const args = {
      tradeStateBump: tradeBump,
      freeTradeStateBump: freeTradeBump,
      programAsSignerBump: signerBump,
      auctioneerAuthorityBump: 254,
      tokenSize: new BN(Math.ceil(1 * 1)),
      startTime: 1657691565,
      endTime: 1677534999,
      reservePrice: 1,
      minBidIncrement: 1,
      timeExtPeriod: 10000,
      timeExtDelta: 1000,
      allowHighBidCancel: true
    }
    // console.log(args)
    const sellInstruction  =  await createSellInstruction(accounts,args)

   let tx = new Transaction();
      tx.add(sellInstruction);
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
     
       tx.feePayer = publicKey
       
       tx.sign(wallet);
      
      const signature = await connection.sendRawTransaction(tx.serialize());

      const Transact = await connection.confirmTransaction(signature, 'confirmed');

      console.log(Transact);

//Bid




}
by();
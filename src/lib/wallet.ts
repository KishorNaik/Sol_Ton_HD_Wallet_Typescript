import {
  KeyPair,
  getSecureRandomBytes,
  mnemonicNew,
  mnemonicToHDSeed,
  mnemonicToPrivateKey,
} from "@ton/crypto";
import * as bip39 from "bip39";
import * as bip32 from "bip32";
import * as ecc from "tiny-secp256k1";
import BIP32Factory from "bip32";
import { WalletContractV4 } from "@ton/ton";

export interface GenerateWalletOptions {
  seed: Buffer;
  path: number;
}

export interface GenerateWalletResult {
  address: string;
  privateKey: string;
  publicKey: string;
}

export interface ITonWallet {
  generateWalletAsync(
    params: GenerateWalletOptions
  ): Promise<GenerateWalletResult>;
}

export class TonWallet implements ITonWallet {
  public async generateWalletAsync(
    params: GenerateWalletOptions
  ): Promise<GenerateWalletResult> {
    try {
      // Get Seed and Path
      const { seed, path } = params;

      // Without derivation Path
      //let mnemonics = await mnemonicNew();
      //let keyPair = await mnemonicToPrivateKey(mnemonics);

      const bip32 = BIP32Factory(ecc);
      const hdWallet = bip32.fromSeed(seed);

      // Define the derivation path
      const derivationPath = `m/44'/396'/0'/0/${path}`;

      const child = hdWallet.derivePath(derivationPath);

      const keyPair: KeyPair = await mnemonicToPrivateKey(
        child.privateKey?.toString("utf-8").split(" ")!
      );

      let workchain = 0; // Usually you need a workchain 0
      let wallet = WalletContractV4.create({
        workchain,
        publicKey: keyPair.publicKey,
      });

      const address = wallet.address.toString();
      const publicKey = wallet.publicKey.toString("hex");
      const privateKey = keyPair.secretKey.toString("hex");

      const result: GenerateWalletResult = {
        address: address,
        privateKey,
        publicKey,
      };

      return result;
    } catch (ex) {
      throw ex;
    }
  }
}

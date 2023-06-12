import {
    Connection,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    Cluster,
} from "@solana/web3.js";
import { Metaplex, keypairIdentity, sol } from "@metaplex-foundation/js";

export class Wallet {
    keypair: Keypair

    constructor() {
        this.keypair = Keypair.generate();
    }

    public getPublicKey(): PublicKey {
        return this.keypair.publicKey;
    }
}

export class Controller {

    metaplex: Metaplex                                     
    cluster: Cluster
    currentWallet: Wallet
    wallets: Wallet[]

    constructor() {
        this.wallets = [];
        this.cluster = 'devnet';
        const endpoint = clusterApiUrl(this.cluster);
        const connection = new Connection(endpoint, "confirmed");
        this.metaplex = new Metaplex(connection);
        this.currentWallet = this.getCurrentWallet();
    }

    private stringToCluster(clusterString: string): Cluster {
        let cluster: Cluster = 'devnet';

        switch (clusterString) {
            case "devnet": {
                cluster = 'devnet';
                break;
            }
            case "testnet": {
                cluster = 'testnet';
                break;
            }
            case "mainnet-beta": {
                cluster = 'mainnet-beta';
                break;
            }
        }

        return cluster;
    }

    public setCluster(newCluster: string) {
        const clusterTemp = this.stringToCluster(newCluster);

        if (this.cluster === clusterTemp) {
            return;
        }

        this.cluster = clusterTemp;

        const endpoint = clusterApiUrl(this.cluster);
        const connection = new Connection(endpoint, "confirmed");
        this.metaplex = new Metaplex(connection); 
    }

    public getCluster(): string {
        return this.cluster.toString();
    }

    public async getBalance() {
        const balance = await this.metaplex.rpc().getBalance(this.currentWallet.getPublicKey());
        const balanceSOL = balance.basisPoints.toNumber() / LAMPORTS_PER_SOL;

        return balanceSOL.toString();
    }

    public async airdrop() {
        try {
            await this.metaplex.rpc().airdrop(this.currentWallet.getPublicKey(), sol(2));
            return 0;
          } catch (e) {
            return e;
          }
    }

    public generateNewWallet() {
        let newWallet = new Wallet();

        if (this.wallets.length == 0) {
            this.currentWallet = newWallet;
        }

        this.wallets.push(newWallet);
    }

    public getCurrentWallet(): Wallet {
        return this.currentWallet;
    }

    public setCurrentWallet(selectedPublicKey: string) {
        console.log("Selected wallet: ", selectedPublicKey);
        this.wallets.forEach(element => {
            if (element.getPublicKey().toString() == selectedPublicKey) {
                this.currentWallet = element;
            }
        })
  
    }

    public getAllPublicKeys(): string[] {
        let walletsArray: string[] = [];

        this.wallets.forEach(element => {
            walletsArray.push(element.getPublicKey().toString());
        })

        return walletsArray;
    }
}
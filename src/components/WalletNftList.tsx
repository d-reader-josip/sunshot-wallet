import { useFetchNfts } from "../api/helius";
import { defaultGetNftsResponse } from "../models/getNftsResponse";

const WalletNftList: React.FC = () => {
  const { data: getNfts = defaultGetNftsResponse } = useFetchNfts(
    "7aLBCrbn4jDNSxLLJYRRnKbkqA5cuaeaAzn74xS7eKPD"
  );

  return (
    <div className="wallet-nft-list">
      {getNfts.nfts.map((nft) => (
        <div className="wallet-nft" key={nft.tokenAddress}>
          <img
            className="wallet-nft-image"
            src={nft.imageUrl}
            draggable={false}
            alt=""
          />
          <span className="wallet-nft-name">{nft.name}</span>
        </div>
      ))}
    </div>
  );
};

export default WalletNftList;

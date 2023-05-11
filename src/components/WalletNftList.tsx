import { useFetchNfts } from "../api/helius";
import { defaultGetNftsResponse } from "../models/getNftsResponse";

interface Props {
  address: string;
}

const WalletNftList: React.FC<Props> = ({ address }) => {
  const { data: getNfts = defaultGetNftsResponse } = useFetchNfts(address);

  return (
    <div className="wallet-nft-list">
      mainnet-beta tokens:
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

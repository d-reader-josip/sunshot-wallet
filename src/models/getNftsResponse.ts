export interface GetNftsResponse {
  numberOfPages: number;
  nfts: [
    {
      name: string;
      tokenAddress: string;
      collectionAddress: string;
      collectionName: string;
      imageUrl: string;
      traits: NftTrait[];
    }
  ];
}

export const defaultGetNftsResponse: GetNftsResponse = {
  numberOfPages: 0,
  nfts: [
    {
      name: "",
      tokenAddress: "",
      collectionAddress: "",
      collectionName: "",
      imageUrl: "",
      traits: [],
    },
  ],
};

interface NftTrait {
  trait_type: string;
  value: string;
}

export const HELIUS_QUERY_KEYS = Object.freeze({
  V0: "v0",
  ADDRESSES: "addresses",
  NFTS: "nfts",
});

export const heliusKeys = Object.freeze({
  nfts: (address: string) => [
    HELIUS_QUERY_KEYS.V0,
    HELIUS_QUERY_KEYS.ADDRESSES,
    address,
    HELIUS_QUERY_KEYS.NFTS,
  ],
});

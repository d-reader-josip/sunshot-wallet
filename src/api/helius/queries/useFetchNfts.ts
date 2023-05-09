import { heliusKeys, HELIUS_QUERY_KEYS } from "../heliusKeys";
import { useQuery } from "react-query";
import { GetNftsResponse } from "../../../models/getNftsResponse";
import { MessageType } from "../../../models/message";
import vscode from "../../../constants/vscode";
import http from "../../http";
import axios, { AxiosError } from "axios";

const { V0, ADDRESSES, NFTS } = HELIUS_QUERY_KEYS;

const fetchNfts = async (address: string): Promise<GetNftsResponse> => {
  const response = await http.get<GetNftsResponse>(
    `${V0}/${ADDRESSES}/${address}/${NFTS}`,
    { params: { pageNumber: 1 /* TODO: implement pagination */ } }
  );
  return response.data;
};

export const useFetchNfts = (address: string) => {
  return useQuery([...heliusKeys.nfts(address)], () => fetchNfts(address), {
    staleTime: 1000 * 60 * 10, // Stale for 10 minutes
    onError: (error: any | AxiosError<any>) => {
      let message = "";
      if (axios.isAxiosError(error)) {
        message = error.message;
      } else if (Array.isArray(error?.message)) {
        message = error.message.join(", ");
      } else {
        message = error?.message || "Unknown error: " + JSON.stringify(error);
      }

      vscode.postMessage({
        type: MessageType.Error,
        payload: message,
      });
    },
    retry: 2,
  });
};

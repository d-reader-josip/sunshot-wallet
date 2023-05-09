import * as React from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Message, MessageType } from "./models/message";
import WalletNftList from "./components/WalletNftList";
import vscode from "./constants/vscode";
import "./app.css";

// TODO: think about 'devnet'. If we're relying on Helius too much, how do we handle 'devnet' environment
// TODO: should we create our own backend for storing (caching/indexing) data
// TODO: where do we store local (environment) data like Helius API key, private keys etc.?
// TODO: skeleton loading (and image optimization!)

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [publicKey, setPublicKey] = useState("");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="wallet-form">
        <label>
          Public Key:&nbsp;
          <input
            name="public-key"
            type="text"
            placeholder="public key"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
          />
        </label>
        <br />
        <button
          type="button"
          onClick={() => {
            vscode.postMessage<Message>({
              type: MessageType.PublicKey,
              payload: publicKey,
            });
          }}
        >
          Search
        </button>
      </div>
      <main>
        <WalletNftList />
      </main>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;

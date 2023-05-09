type Message = import("../src/view/messages/messageTypes").Message;

export interface WebviewApi<StateType> {
  postMessage<T extends Message = Message>(message: T): void;
  getState(): StateType | undefined;
  setState<T extends StateType | undefined>(newState: T): T;
}

declare global {
  function acquireVsCodeApi<StateType = unknown>(): WebviewApi<StateType>;
}

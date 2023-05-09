export enum MessageType {
  PublicKey = "PUBLIC_KEY",
  Error = "ERROR",
}

export interface Message {
  type: MessageType;
  payload?: any;
}

export interface PublicKeyMessage extends Message {
  type: MessageType.PublicKey;
  payload: string;
}

export interface ErrorMessage extends Message {
  type: MessageType.Error;
  payload: string;
}

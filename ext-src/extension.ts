import * as path from "path";
import * as vscode from "vscode";
import { ExtensionContext } from "vscode";
import { Message, MessageType } from "../src/models/message";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("sunshot.start", () => {
      WalletPanel.createOrShow(context);
    })
  );
}

class WalletPanel {
  public static currentPanel: WalletPanel | undefined;

  private static readonly viewType = "react";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (WalletPanel.currentPanel) {
      WalletPanel.currentPanel._panel.reveal(column);
    } else {
      WalletPanel.currentPanel = new WalletPanel(
        context,
        column || vscode.ViewColumn.One
      );
    }
  }

  private constructor(context: ExtensionContext, column: vscode.ViewColumn) {
    this._extensionPath = context.extensionPath;

    this._panel = vscode.window.createWebviewPanel(
      WalletPanel.viewType,
      "Wallet",
      column,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(this._extensionPath, "build")),
        ],
      }
    );

    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.onDidReceiveMessage(
      (message: Message) => {
        switch (message.type) {
          case MessageType.Error:
            vscode.window.showErrorMessage(message.payload);
            return;
          case MessageType.PublicKey:
            vscode.window.showInformationMessage(message.payload);
            return;
          default:
            console.log("Unhandled message: ", message);
            return;
        }
      },
      null,
      this._disposables
    );

    context.globalState.update(
      MessageType.PublicKey,
      "7aLBCrbn4jDNSxLLJYRRnKbkqA5cuaeaAzn74xS7eKPD"
    );
    // const publicKey = context.globalState.get<string>("publicKey");
    // this._panel.webview.postMessage({
    //   type: MessageType.PublicKey,
    //   payload: publicKey,
    // });
  }

  public doRefactor() {
    this._panel.webview.postMessage({ command: "refactor" });
  }

  public dispose() {
    WalletPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const manifest = require(path.join(
      this._extensionPath,
      "build",
      "asset-manifest.json"
    ));
    const mainScript = manifest["files"]["main.js"];
    const mainStyle = manifest["files"]["main.css"];

    const scriptPathOnDisk = vscode.Uri.file(
      path.join(this._extensionPath, "build", mainScript)
    );
    const scriptUri = scriptPathOnDisk.with({ scheme: "vscode-resource" });
    const stylePathOnDisk = vscode.Uri.file(
      path.join(this._extensionPath, "build", mainStyle)
    );
    const styleUri = stylePathOnDisk.with({ scheme: "vscode-resource" });

    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
				<meta name="theme-color" content="#000000">
				<title>Sunshot</title>
				<link rel="stylesheet" type="text/css" href="${styleUri}">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: 'nonce-${nonce}'; script-src 'nonce-${nonce}';style-src vscode-resource: 'unsafe-inline' http: https: data:; connect-src https:">
				<base href="${vscode.Uri.file(path.join(this._extensionPath, "build")).with({
          scheme: "vscode-resource",
        })}/">
			</head>

			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root"></div>
				
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

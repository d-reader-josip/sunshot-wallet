import * as path from "path";
import * as vscode from "vscode";
import { ExtensionContext } from "vscode";
import { Message, MessageType } from "../src/models/message";
import { Controller } from "./controller";


export async function activate(context: vscode.ExtensionContext) {
  let m_walletStatusBar: vscode.StatusBarItem;
  let m_clusterStatusBar: vscode.StatusBarItem;

  var controller = new Controller();

  // Create UI
  context.subscriptions.push(
    vscode.commands.registerCommand("sunshot.start", () => {
      WalletPanel.createOrShow(context);
    })
  );

  // Create new wallet
  context.subscriptions.push(
    vscode.commands.registerCommand("sunshot.create", () => {
      /*
      const newKeypair = Keypair.generate();
      const publicKey = newKeypair.publicKey;
      const secretKey = newKeypair.secretKey;

      const wsedit = new vscode.WorkspaceEdit();
      if (!vscode.workspace.workspaceFolders) {
        vscode.window.showInformationMessage("Open a folder/workspace first");
        return;
      }

      // TODO: find better place to store wallets, not current workspace; maybe VS CODE app root: "vscode.env.appRoot"
      const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
      const filePath = vscode.Uri.file(wsPath + '/wallets/' + publicKey.toString() + '.txt');
      wsedit.createFile(filePath, { ignoreIfExists: true });
      vscode.workspace.applyEdit(wsedit);

      setTimeout(() => {
        // TODO: update it so it doesn't open text file while still update it
        vscode.workspace.openTextDocument(filePath).then((a: vscode.TextDocument) => {
          vscode.window.showTextDocument(a, 1, false).then(e => {
              e.edit(edit => {
                edit.insert(new vscode.Position(0, 0), publicKey.toString() + '\n' + secretKey.toString());
              });
              e.document.save();
          });
        }, (error: any) => {
            console.error(error);
            debugger;
        });
      }, 500);

      vscode.window.showInformationMessage('Created wallet: ' + formatWallet(publicKey.toString()));
      */

      controller.generateNewWallet();

      // TODO; make generateNewWallet return public key of newly generated wallet and output it

      // Some wallet is already selected; no need to proceed and select new one or register commands again
      if (controller.getAllPublicKeys().length > 1) {
        return;
      }
     
      // register command for selecting wallet
      const selectCommand = 'sunshot.select';
      context.subscriptions.push(vscode.commands.registerCommand(selectCommand, async () => {
        const allGeneratedKeys = controller.getAllPublicKeys();
        const result = await vscode.window.showQuickPick(
          allGeneratedKeys, {
          placeHolder: 'Select a wallet',
        });
        
        if (result) {
          m_walletStatusBar.text = "$(account) " + formatWallet(result.toString());
          controller.setCurrentWallet(result.toString());
        }
      }));

      // register command for changing cluster
      const selectCommand2 = 'sunshot.change';
      context.subscriptions.push(vscode.commands.registerCommand(selectCommand2, async () => {
        const result = await vscode.window.showQuickPick(
          ['devnet', 'testnet', 'mainnet-beta'], {
          placeHolder: 'Select cluster',
        });
        
        if (result) {
          controller.setCluster(result.toString());
          m_clusterStatusBar.text = "$(type-hierarchy) " + controller.getCluster();
        }
      }));

      // create wallet status bar and bind "select wallet" command to it
      m_walletStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3);
      m_walletStatusBar.command = selectCommand;
      context.subscriptions.push(m_walletStatusBar);
      m_walletStatusBar.text = "$(account) " + formatWallet(controller.getCurrentWallet().getPublicKey().toString());
      m_walletStatusBar.tooltip = "Currently selected wallet"
      m_walletStatusBar.show();

      // create cluster status bar nd bind "change cluster" command to it
      m_clusterStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2);
      m_clusterStatusBar.command = selectCommand2;
      context.subscriptions.push(m_clusterStatusBar);
      m_clusterStatusBar.text = "$(type-hierarchy) " + controller.getCluster();
      m_clusterStatusBar.tooltip = "Currently selected cluster"
      m_clusterStatusBar.show();
    })
  );

  // Balance command
  context.subscriptions.push(
    vscode.commands.registerCommand("sunshot.balance", async () => {

      if (controller.getCurrentWallet() == undefined) {
        vscode.window.showInformationMessage("Wallet is not selected!");
        return;
      }

      controller.getBalance().then(result => {
        vscode.window.showInformationMessage(String(formatWallet(controller.getCurrentWallet().getPublicKey().toString()) + ": [ " + result + " $SOL ]"));  
      });
    })
  );

  // Airdrop command
  context.subscriptions.push(
    vscode.commands.registerCommand("sunshot.airdrop", async () => {

      if (controller.getCurrentWallet() == undefined) {
        vscode.window.showInformationMessage("Wallet is not selected!");
        return;
      }

      controller.airdrop().then(result => {
        if (result == 0) {
          vscode.window.showInformationMessage(String("Successfully airdropped 2 $SOL to: " + formatWallet(controller.getCurrentWallet().getPublicKey().toString()))); 
        }
        else {
          vscode.window.showInformationMessage(String(result));  
        }
      });     
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

function formatWallet(wallet: String)
{
  return String(wallet.slice(0, 4) + '....' + wallet.slice(-4));
}


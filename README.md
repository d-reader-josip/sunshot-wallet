# Sunshot wallet
> first of its kind, developer-oriented and VSC-native wallet

## Development

Run following commands in the terminal

```shell
yarn install --ignore-engines
yarn run build
```
And then press F5, in Extension Development Host session, run `Sunshot` command from command palette.

## Limitations

Right now you can only run production bits (`yarn run build`) in the webview, how to make dev bits work (webpack dev server) is still unknown yet. Suggestions and PRs welcome!
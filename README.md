# TON Block Viewer

A bakti-styled Next.js dApp for the TON testnet.

## What it does
- Masterchain last block info from toncenter
- seqno and shards

## Testnet
- Network: TON testnet
- RPC endpoint: https://testnet.toncenter.com/api/v2 (HTTP API)

## Wallet
- TON wallets via @tonconnect/ui-react (TON Connect). Connect from the header to sign transactions on TON testnet.

## Usage
```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
```
Enter a testnet address / hash / value in the tool and read live on-chain data. Connect a wallet for actions that sign or send.

## Faucet
- Testnet TON: @testgiver_ton_bot on Telegram

## Limitations
- Testnet only. Reads live data over the public RPC above.
- Wallet connect + signing requires a browser wallet extension and a funded testnet account; not exercised in headless CI.
- Stack: Next.js 15, TypeScript, Tailwind v4. Design system shared across all tools.

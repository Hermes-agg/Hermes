WalletProvider (Hermes)

Purpose

- Provide a lightweight Solana wallet connection and balance context for the app.
- Uses the browser `window.solana` provider (e.g., Phantom) for connect/disconnect.
- Exposes `useWallet()` for components to access `connected`, `address`, `solBalance`, `tokens`, and methods `connect()`, `disconnect()`, `refreshBalances()`.

Files

- `components/app/providers/WalletProvider.tsx` — React client provider and context implementation.
- `hooks/use-wallet.ts` — Small hook wrapper that re-exports the provider hook.
- `lib/solana.ts` — Minimal JSON-RPC helpers used to fetch SOL and token balances.

How to use

1. Ensure the app is wrapped with `WalletProvider`. The project already wraps `AppLayout` with it in `components/app/layout/app-layout.tsx`.

2. In any client component, import the hook:

```tsx
import { useWallet } from '@/hooks/use-wallet'

const { connected, address, solBalance, tokens, connect, disconnect, refreshBalances } = useWallet()
```

3. Call `connect()` to prompt the user to connect their wallet. `disconnect()` will disconnect.

RPC endpoint

- The provider defaults to `https://api.mainnet-beta.solana.com` but you can set a custom RPC by adding `NEXT_PUBLIC_SOLANA_RPC` in `.env.local`.

Notes & limitations

- This implementation is intentionally lightweight and depends on `window.solana` being present. For multi-wallet / production-ready integration consider using `@solana/wallet-adapter` packages.
- Token metadata (symbol, logo) is not fetched here — we return token `mint`, `uiAmount`, and `decimals`. You can enrich token metadata with on-chain metadata lookups or a token list service.

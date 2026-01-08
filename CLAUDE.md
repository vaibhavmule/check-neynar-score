# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Check Neynar Score is a Farcaster Mini App (formerly Frames v2) built with Next.js 15, React 19, and TypeScript. The app allows users to check their Neynar Score - a quality metric for Farcaster users ranging from 0 to 1. It also includes a daily rewards system where users can claim DEGEN tokens (on Base) and CELO tokens (on Celo) through smart contracts.

## Commands

### Development
```bash
npm run dev              # Start development server with custom dev script
npm run build            # Production build (runs build script with env setup)
npm run build:raw        # Direct Next.js build without env script
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Deployment
```bash
npm run deploy:vercel    # Deploy to Vercel with interactive setup (uses tsx)
npm run deploy:raw       # Direct Vercel deployment without setup
```

### Utilities
```bash
npm run cleanup          # Clean up project files (custom cleanup script)
```

## Architecture

### Core Structure

**Entry Points:**
- `src/app/page.tsx` - Main page, dynamically imports App component (SSR disabled)
- `src/app/app.tsx` - Thin wrapper that dynamically imports the main App component
- `src/components/App.tsx` - **Primary application orchestrator** handling:
  - Farcaster mini app SDK initialization
  - User context and score fetching
  - Tab navigation state
  - Haptic feedback and back navigation integration
  - Auto-triggering "Add to App" prompts

**Provider Architecture:**
The app uses a nested provider structure defined in `src/app/providers.tsx`:
1. `MiniAppProvider` - Farcaster mini app SDK context
2. `WagmiProvider` - Web3 wallet integration (Base, Celo, Optimism, Mainnet, Degen, Unichain)
3. `SafeFarcasterSolanaProvider` - Solana wallet support
4. Root layout applies safe area insets and gradient backgrounds

**Wagmi Configuration** (`src/components/providers/WagmiProvider.tsx`):
- Supports multiple chains: Base, Celo, Optimism, Mainnet, Degen, Unichain
- Connectors: Farcaster Frame, Coinbase Wallet, MetaMask
- Implements auto-connection for Coinbase Wallet detection

### Tab System

The app uses a bottom navigation with three tabs (defined in `src/components/ui/BottomNav.tsx`):
- **Score Tab** (`src/components/ui/tabs/ScoreTab.tsx`) - Default view showing user's Neynar Score with score cards
- **Rewards Tab** (`src/components/ui/tabs/RewardsTab.tsx`) - Daily claim interface for CELO and DEGEN rewards
- **Improve Tab** (`src/components/ui/tabs/ImproveTab.tsx`) - Tips and casts about improving Neynar Score

### Smart Contract Integration

**DailyClaim Contract System:**
The app interacts with two daily reward contracts sharing the same ABI (`DAILY_CLAIM_ABI` in `src/lib/constants.ts`):

1. **Celo Rewards** (`src/hooks/useCeloReward.ts`):
   - Contract: `0xCCf2cE5a423958d107F32c9e30767b00B6791d99` (Celo mainnet)
   - Chain ID: 42220
   - Users claim CELO tokens once per 24 hours
   - Note: Contract may not support `getContractBalance` function

2. **DEGEN Rewards** (`src/hooks/useDailyClaimReward.ts`):
   - Contract: `0x7DD548f786C49F96255D4883504b247c04e2f5E4` (Base mainnet)
   - Chain ID: 8453
   - Users claim DEGEN tokens once per 24 hours
   - Properly handles first-time users (lastClaimTime = 0)

**Contract Implementation** (`contracts/DailyClaim.sol`):
- Solidity 0.8.20 with OpenZeppelin dependencies
- Features: daily claim cooldown, owner-controlled parameters, emergency withdrawal
- Uses ReentrancyGuard for claim function security

### API Routes

Located in `src/app/api/`:

**Authentication & Signers:**
- `auth/nonce/` - Generate nonce for SIWE authentication
- `auth/signer/` - Create and lookup Farcaster signers
- `auth/signer/signed_key/` - Handle signed key operations
- `auth/signers/` - Manage multiple signers
- `auth/session-signers/` - Session-based signer management
- `auth/validate/` - Validate authentication tokens

**User Data:**
- `users/` - Fetch user data
- `best-friends/` - Get user's best friends list
- `follow/check/` - Check follow status

**Notifications & Webhooks:**
- `send-notification/` - Send Farcaster mini app notifications
- `webhook/` - Handle Neynar webhooks

**Cast & Metadata:**
- `cast/` - Cast-related operations
- `frame-metadata/` - Generate frame metadata
- `opengraph-image/` - Dynamic OG image generation

**Configuration:**
- `.well-known/farcaster.json/` - Farcaster mini app manifest

### State Management

**User State** (`src/hooks/useNeynarUser.ts`):
- Fetches user data and Neynar Score from Neynar SDK
- Handles loading and error states
- Integrates with Farcaster context for FID-based lookups

**Wallet State:**
- Uses Wagmi hooks (`useAccount`, `useReadContract`, `useWriteContract`) for chain interactions
- Real-time countdown timers for claim eligibility
- Transaction status tracking with automatic data refetching

### Neynar SDK Integration

**Client Setup** (`src/lib/neynar.ts`):
- Singleton pattern for `NeynarAPIClient` initialization
- Helper functions: `getNeynarUser()`, `sendNeynarMiniAppNotification()`
- API key configured via `NEYNAR_API_KEY` environment variable

**Constants** (`src/lib/constants.ts`):
- Centralized configuration for app metadata, URLs, and contract addresses
- App association with FID 1356870 (@vaibhavmule)
- Cast URLs for featured tips on improving Neynar Score
- EIP-712 domain constants for Farcaster signed key requests

### UI Components

**Score Display:**
- `ScoreCard.tsx` - Base score card component
- `GlassScoreCard.tsx` - Glassmorphic variant
- `OrangeScoreCard.tsx` - Orange-themed variant

**Modals:**
- `CeloRewardModal.tsx` - CELO claim interface
- `TipModal.tsx` - Tipping interface with USDC support
- `RestructuringNoticeModal.tsx` - Announcement modal

**Utility Components:**
- `Header.tsx` - App header with user info
- `AddAppPrompt.tsx` - Prompt to add app to Farcaster
- `CastDisplay.tsx`, `CastList.tsx` - Display casts from featured users

### Key Hooks

- `useNeynarUser()` - Fetch and manage Neynar user data
- `useDailyClaimReward()` - DEGEN reward contract interaction (Base)
- `useCeloReward()` - CELO reward contract interaction (Celo)
- `useQuickAuth()` - Farcaster quick authentication
- `useDetectClickOutside()` - Click outside detection for modals

## Environment Variables

Required variables (see `.env.local`):
```
NEYNAR_API_KEY          # Neynar API key
NEYNAR_CLIENT_ID        # Neynar client ID
NEXT_PUBLIC_URL         # App URL (auto-detected on Vercel)
KV_REST_API_TOKEN       # Upstash Redis token (optional)
KV_REST_API_URL         # Upstash Redis URL (optional)
USE_TUNNEL              # Enable localtunnel for local development
```

## Development Notes

### Local Development
- The `dev` script (`scripts/dev.js`) handles environment setup and may configure tunneling for local Farcaster testing
- Dynamic imports are required for components using the Farcaster Frame SDK to prevent SSR issues
- Safe area insets are applied from Farcaster context for proper mobile rendering

### Smart Contract Development
- No Hardhat or Foundry config detected - contracts may be deployed manually
- Contract addresses and ABIs are configured in `src/lib/constants.ts`
- When modifying contract interactions, update both hooks and the shared ABI

### Styling
- Uses Tailwind CSS with custom gradient backgrounds
- Dark mode support via Tailwind's `dark:` variants
- Glass morphism effects for modern UI aesthetic
- Mobile-first responsive design

### Mini App SDK Integration
- Must call `sdk.actions.ready()` when app is loaded to dismiss splash screen
- Haptic feedback available via `sdk.haptics.notificationOccurred()`
- Back navigation enabled via `sdk.back.enableWebNavigation()` if supported
- Capabilities checked before using SDK features

### Deployment
- Designed for Vercel deployment with automatic VERCEL_URL detection
- `deploy:vercel` script handles interactive deployment with environment setup
- Framework automatically detected as Next.js in `vercel.json`

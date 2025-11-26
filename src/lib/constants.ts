import { type AccountAssociation } from '@farcaster/miniapp-core/src/manifest';

/**
 * Application constants and configuration values.
 *
 * This file contains all the configuration constants used throughout the mini app.
 * These values are either sourced from environment variables or hardcoded and provide
 * configuration for the app's appearance, behavior, and integration settings.
 *
 * NOTE: This file is automatically updated by the init script.
 * Manual changes may be overwritten during project initialization.
 */

// --- App Configuration ---
/**
 * The base URL of the application.
 * Used for generating absolute URLs for assets and API endpoints.
 * 
 * Priority:
 * 1. NEXT_PUBLIC_URL (explicitly set)
 * 2. VERCEL_URL (automatically set by Vercel, prefixed with https://)
 * 3. VERCEL_BRANCH_URL (preview deployments on Vercel)
 * 4. Falls back to empty string if running client-side without env vars
 */
function getAppUrl(): string {
  // Explicit URL takes priority
  const explicitUrl = process.env.NEXT_PUBLIC_URL;
  if (explicitUrl) {
    return explicitUrl;
  }

  // Vercel production URL
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  // Vercel preview/branch URL
  const vercelBranchUrl = process.env.VERCEL_BRANCH_URL;
  if (vercelBranchUrl) {
    return `https://${vercelBranchUrl}`;
  }

  // Fallback: try to get from window location if client-side
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Fallback to empty string during SSR if no env vars (will be handled by validation)
  return '';
}

export const APP_URL: string = getAppUrl();

/**
 * The name of the mini app as displayed to users.
 * Used in titles, headers, and app store listings.
 */
export const APP_NAME: string = 'Check Neynar Score';

/**
 * A brief description of the mini app's functionality.
 * Used in app store listings and metadata.
 */
export const APP_DESCRIPTION: string = 'Check your Neynar Score - a metric ranging from 0 to 1 that evaluates the quality of user interactions on the Farcaster platform.';

/**
 * The primary category for the mini app.
 * Used for app store categorization and discovery.
 */
export const APP_PRIMARY_CATEGORY: string = 'social';

/**
 * Tags associated with the mini app.
 * Used for search and discovery in app stores.
 */
export const APP_TAGS: string[] = ['neynar', 'farcaster', 'analytics', 'reputation', 'profile', 'score'];

/**
 * Farcaster FID of the developer that users must follow to use the app.
 */
export const DEVELOPER_FID: number = 1356870;

/**
 * Username of the developer for quick display and profile navigation.
 */
export const DEVELOPER_USERNAME: string = 'vaibhavmule';

/**
 * Wallet address used to receive developer tips via the wallet flow.
 */
export const DEVELOPER_TIP_ADDRESS: `0x${string}` = '0x6828D9e13B9C5BF166d58F60340FD8C3D1FE7693';
 
// --- Asset URLs ---
/**
 * URL for the app's icon image.
 * Used in app store listings and UI elements.
 */
export const APP_ICON_URL: string = `${APP_URL}/icon.png`;

/**
 * URL for the app's Open Graph image.
 * Used for social media sharing and previews.
 */
export const APP_OG_IMAGE_URL: string = `${APP_URL}/api/opengraph-image`;

/**
 * URL for the app's splash screen image.
 * Displayed during app loading.
 */
export const APP_SPLASH_URL: string = `${APP_URL}/splash.png`;

/**
 * Background color for the splash screen.
 * Used as fallback when splash image is loading.
 */
export const APP_SPLASH_BACKGROUND_COLOR: string = '#f7f7f7';

/**
 * Account association for the mini app.
 * Used to associate the mini app with a Farcaster account.
 * If not provided, the mini app will be unsigned and have limited capabilities.
 */
export const APP_ACCOUNT_ASSOCIATION: AccountAssociation | undefined = {
  header: "eyJmaWQiOjEzNTY4NzAsInR5cGUiOiJhdXRoIiwia2V5IjoiMHhGRmUxNjg5OEZDMGFmODBlZTlCQ0YyOUQyQjU0YTBGMjBGOTQ5OGFkIn0",
  payload: "eyJkb21haW4iOiJjaGVjay1uZXluYXItc2NvcmUudmVyY2VsLmFwcCJ9",
  signature: "1J51HyanR8Znm0nSSIGGW6cqr0mzcg5t71dK4Ix7G8QbApWzAalhg8B2XXxia2EGHRtXAhZAVGfC6U9MCVdhfhw="
};

// --- UI Configuration ---
/**
 * Text displayed on the main action button.
 * Used for the primary call-to-action in the mini app.
 */
export const APP_BUTTON_TEXT: string = 'Check Neynar Score';

// --- Integration Configuration ---
/**
 * Webhook URL for receiving events from Neynar.
 *
 * If Neynar API key and client ID are configured, uses the official
 * Neynar webhook endpoint. Otherwise, falls back to a local webhook
 * endpoint for development and testing.
 */
export const APP_WEBHOOK_URL: string =
  process.env.NEYNAR_API_KEY && process.env.NEYNAR_CLIENT_ID
    ? `https://api.neynar.com/f/app/${process.env.NEYNAR_CLIENT_ID}/event`
    : `${APP_URL}/api/webhook`;

/**
 * Flag to enable/disable wallet functionality.
 *
 * When true, wallet-related components and features are rendered.
 * When false, wallet functionality is completely hidden from the UI.
 * Useful for mini apps that don't require wallet integration.
 */
export const USE_WALLET: boolean = false;

/**
 * Flag to enable/disable analytics tracking.
 *
 * When true, usage analytics are collected and sent to Neynar.
 * When false, analytics collection is disabled.
 * Useful for privacy-conscious users or development environments.
 */
export const ANALYTICS_ENABLED: boolean = true;

/**
 * Required chains for the mini app.
 *
 * Contains an array of CAIP-2 identifiers for blockchains that the mini app requires.
 * If the host does not support all chains listed here, it will not render the mini app.
 * If empty or undefined, the mini app will be rendered regardless of chain support.
 *
 * Supported chains: eip155:1, eip155:137, eip155:42161, eip155:10, eip155:8453,
 * solana:mainnet, solana:devnet
 */
export const APP_REQUIRED_CHAINS: string[] = [];

/**
 * Return URL for the mini app.
 *
 * If provided, the mini app will be rendered with a return URL to be rendered if the
 * back button is pressed from the home page.
 */
export const RETURN_URL: string | undefined = undefined;

// PLEASE DO NOT UPDATE THIS
export const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
  name: 'Farcaster SignedKeyRequestValidator',
  version: '1',
  chainId: 10,
  verifyingContract:
    '0x00000000fc700472606ed4fa22623acf62c60553' as `0x${string}`,
};

// PLEASE DO NOT UPDATE THIS
export const SIGNED_KEY_REQUEST_TYPE = [
  { name: 'requestFid', type: 'uint256' },
  { name: 'key', type: 'bytes' },
  { name: 'deadline', type: 'uint256' },
];

// --- Daily Reward Contract Configuration ---
/**
 * Daily reward contract address on Arbitrum.
 * Users can claim 0.025 ARB tokens once per day from this contract.
 */
export const REWARD_CONTRACT_ADDRESS: `0x${string}` = '0xE4895Ee66a1C1A890Abb158CDfC66925f92eE2A5';

/**
 * ARB token contract address on Arbitrum.
 */
export const ARB_TOKEN_ADDRESS: `0x${string}` = '0x912CE59144191C1204E64559FE8253a0e49E6548';

/**
 * Arbitrum chain ID.
 */
export const ARBITRUM_CHAIN_ID = 42161;

/**
 * DailyClaim contract ABI.
 * Minimal ABI containing only the functions needed for frontend interaction.
 */
export const DAILY_CLAIM_ABI = [
  {
    inputs: [],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'lastClaimTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'dailyAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'Claimed',
    type: 'event',
  },
] as const;

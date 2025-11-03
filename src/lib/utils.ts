import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Manifest } from '@farcaster/miniapp-core/src/manifest';
import {
  APP_BUTTON_TEXT,
  APP_DESCRIPTION,
  APP_ICON_URL,
  APP_NAME,
  APP_OG_IMAGE_URL,
  APP_PRIMARY_CATEGORY,
  APP_SPLASH_BACKGROUND_COLOR,
  APP_SPLASH_URL,
  APP_TAGS,
  APP_URL,
  APP_WEBHOOK_URL,
  APP_ACCOUNT_ASSOCIATION,
} from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMiniAppEmbedMetadata(
  ogImageUrl?: string,
  options?: { mode?: 'default' | 'scoreInfo' }
) {
  const mode = options?.mode ?? 'default';
  const isScoreInfo = mode === 'scoreInfo';
  const embedTitle = isScoreInfo ? 'What is Neynar Score?' : APP_NAME;
  const embedUrl = isScoreInfo ? `${APP_URL}?score` : APP_URL;
  const embedDescription = APP_DESCRIPTION;

  return {
    version: 'next',
    imageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    ogTitle: embedTitle,
    ogDescription: embedDescription,
    ogImageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    button: {
      title: isScoreInfo ? 'Learn more' : APP_BUTTON_TEXT,
      action: {
        type: 'launch_frame',
        name: embedTitle,
        url: embedUrl,
        splashImageUrl: APP_SPLASH_URL,
        iconUrl: APP_ICON_URL,
        splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
        description: embedDescription,
        primaryCategory: APP_PRIMARY_CATEGORY,
        tags: APP_TAGS,
      },
    },
  };
}

/**
 * Validates that a URL is a valid HTTPS URL (not localhost or IP)
 */
function validateHttpsUrl(url: string | undefined, fieldName: string): string {
  if (!url || url.trim() === '') {
    throw new Error(`${fieldName} is required but was empty. Please set NEXT_PUBLIC_URL environment variable in Vercel project settings.`);
  }

  try {
    const parsedUrl = new URL(url);
    
    // Must use HTTPS
    if (parsedUrl.protocol !== 'https:') {
      throw new Error(`${fieldName} must use HTTPS protocol, got: ${url}`);
    }

    // Cannot be localhost or IP address
    const hostname = parsedUrl.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      throw new Error(`${fieldName} cannot use localhost or IP addresses, got: ${url}`);
    }

    return url;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`${fieldName} is not a valid URL: ${url}`);
    }
    throw error;
  }
}

export async function getFarcasterDomainManifest(forBaseDirectory = false): Promise<Manifest> {
  // Validate all URLs are HTTPS and not localhost
  const homeUrl = validateHttpsUrl(APP_URL, 'homeUrl');
  const iconUrl = validateHttpsUrl(APP_ICON_URL, 'iconUrl');
  const imageUrl = validateHttpsUrl(APP_OG_IMAGE_URL, 'imageUrl');
  const splashImageUrl = validateHttpsUrl(APP_SPLASH_URL, 'splashImageUrl');
  const webhookUrl = validateHttpsUrl(APP_WEBHOOK_URL, 'webhookUrl');

  if (!APP_ACCOUNT_ASSOCIATION) {
    throw new Error('APP_ACCOUNT_ASSOCIATION is required but was undefined');
  }

  // Enforce Base Directory: max 5 tags
  const normalizedTags: string[] = (APP_TAGS ?? []).slice(0, 5);

  const miniappConfig = {
    version: '1',
    name: APP_NAME ?? 'Neynar Starter Kit',
    homeUrl,
    iconUrl,
    imageUrl,
    buttonTitle: APP_BUTTON_TEXT ?? 'Check Neynar Score',
    splashImageUrl,
    splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
    // Additional fields used by Base App Directory
    primaryCategory: 'social',
    tags: normalizedTags,
    webhookUrl,
  } as unknown as Manifest['miniapp'];

  const manifest: any = {
    accountAssociation: APP_ACCOUNT_ASSOCIATION,
    miniapp: miniappConfig,
  };

  // Only include Base Directory metadata when requested
  if (forBaseDirectory) {
    manifest.baseBuilder = {
      ownerAddress: '0x6828D9e13B9C5BF166d58F60340FD8C3D1FE7693',
    };
  }

  return manifest as Manifest;
}

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

export function getMiniAppEmbedMetadata(ogImageUrl?: string) {
  return {
    version: 'next',
    imageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    ogTitle: APP_NAME,
    ogDescription: APP_DESCRIPTION,
    ogImageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    button: {
      title: APP_BUTTON_TEXT,
      action: {
        type: 'launch_frame',
        name: APP_NAME,
        url: APP_URL,
        splashImageUrl: APP_SPLASH_URL,
        iconUrl: APP_ICON_URL,
        splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
        description: APP_DESCRIPTION,
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

export async function getFarcasterDomainManifest(): Promise<Manifest> {
  // Validate all URLs are HTTPS and not localhost
  const homeUrl = validateHttpsUrl(APP_URL, 'homeUrl');
  const iconUrl = validateHttpsUrl(APP_ICON_URL, 'iconUrl');
  const imageUrl = validateHttpsUrl(APP_OG_IMAGE_URL, 'imageUrl');
  const splashImageUrl = validateHttpsUrl(APP_SPLASH_URL, 'splashImageUrl');
  const webhookUrl = validateHttpsUrl(APP_WEBHOOK_URL, 'webhookUrl');

  if (!APP_ACCOUNT_ASSOCIATION) {
    throw new Error('APP_ACCOUNT_ASSOCIATION is required but was undefined');
  }

  return {
    accountAssociation: APP_ACCOUNT_ASSOCIATION,
    miniapp: {
      version: '1',
      name: APP_NAME ?? 'Neynar Starter Kit',
      homeUrl,
      iconUrl,
      imageUrl,
      buttonTitle: APP_BUTTON_TEXT ?? 'Launch Mini App',
      splashImageUrl,
      splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
      webhookUrl,
    },
  };
}

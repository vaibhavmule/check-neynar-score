import { Metadata } from "next";
import { headers } from "next/headers";
import App from "./app";
import { APP_NAME, APP_DESCRIPTION, APP_OG_IMAGE_URL } from "~/lib/constants";
import { getMiniAppEmbedMetadata } from "~/lib/utils";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  // Read query params from request headers (for embed fetchers)
  let isScore = false;
  try {
    const headersList = await headers();
    // Try multiple header sources that might contain the full request URL
    const requestUrl = 
      headersList.get('x-forwarded-host') && headersList.get('x-forwarded-proto')
        ? `${headersList.get('x-forwarded-proto')}://${headersList.get('x-forwarded-host')}${headersList.get('x-pathname') || '/'}${headersList.get('x-query') || ''}`
        : headersList.get('referer') || '';
    
    if (requestUrl) {
      try {
        const urlObj = new URL(requestUrl);
        isScore = urlObj.searchParams.has('score') || 
                  urlObj.searchParams.get('tab') === 'score' ||
                  urlObj.searchParams.get('tab') === 'what-is-neynar-score';
      } catch (e) {
        // URL parsing failed, fall through to default
      }
    }
  } catch (e) {
    // Headers reading failed, use default
  }
  
  const embed = getMiniAppEmbedMetadata(undefined, { mode: isScore ? 'scoreInfo' : 'default' });
  const title = isScore ? 'What is Neynar Score?' : APP_NAME;
  const description = APP_DESCRIPTION;

  return {
    title,
    openGraph: {
      title,
      description,
      images: [APP_OG_IMAGE_URL],
    },
    other: {
      "fc:frame": JSON.stringify(embed),
    },
  };
}

export default function Home() {
  return (<App />);
}

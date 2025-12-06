import { Metadata } from "next";
import { CASTS, APP_NAME, APP_DESCRIPTION, APP_URL } from "~/lib/constants";
import { getMiniAppEmbedMetadata } from "~/lib/utils";
import { CastPageClient } from "./CastPageClient";

export const revalidate = 300;

function findCastById(castId: string): typeof CASTS[0] | null {
  return CASTS.find(cast => {
    const hashMatch = cast.url.match(/\/([0-9a-fx]+)$/i);
    return hashMatch && hashMatch[1] === castId;
  }) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const castConfig = findCastById(id);
  
  if (castConfig) {
    // Generate cast-specific OpenGraph image URL using castId
    const imageUrl = `${APP_URL}/api/opengraph-image?castId=${encodeURIComponent(id)}`;
    const title = castConfig.title || APP_NAME;
    const description = castConfig.title 
      ? `${castConfig.title} - ${APP_DESCRIPTION}`
      : APP_DESCRIPTION;

    return {
      title: `${title} - ${APP_NAME}`,
      openGraph: {
        title: title,
        description: description,
        images: [imageUrl],
      },
      other: {
        "fc:miniapp": JSON.stringify(getMiniAppEmbedMetadata(imageUrl)),
      },
    };
  }

  // Fallback to default if cast not found
  const defaultImageUrl = `${APP_URL}/api/opengraph-image`;
  return {
    title: APP_NAME,
    openGraph: {
      title: APP_NAME,
      description: APP_DESCRIPTION,
      images: [defaultImageUrl],
    },
    other: {
      "fc:miniapp": JSON.stringify(getMiniAppEmbedMetadata()),
    },
  };
}

export default async function CastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const castConfig = findCastById(id);

  return <CastPageClient castConfig={castConfig} castId={id} />;
}


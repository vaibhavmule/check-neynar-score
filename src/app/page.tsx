import { Metadata } from "next";
import App from "./app";
import { APP_NAME, APP_DESCRIPTION, APP_OG_IMAGE_URL } from "~/lib/constants";
import { getMiniAppEmbedMetadata } from "~/lib/utils";

export const revalidate = 300;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
} = {}): Promise<Metadata> {
  const isScore = !!(searchParams?.score !== undefined || searchParams?.tab === 'score' || searchParams?.tab === 'what-is-neynar-score');
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

import Intro from "@/components/ai/Intro";
import { Metadata } from "next";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "해주세요 법률 전문가",
  description: "해주세요 법률 전문가와 대화해보세요.",
  icons: {
    icon: "images/Favicon192.png",
  },
};

export default async function AiPage() {
  const session = await auth();
  return <Intro userId={session?.user.id} />;
}


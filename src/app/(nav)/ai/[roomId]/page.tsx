interface AiPageProps {
  params: Promise<{ roomId: string }>;
}

export default async function AiPage({ params }: AiPageProps) {
  const { roomId } = await params;
  return <div>{JSON.stringify(roomId)}</div>;
}

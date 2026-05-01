import { redirect } from 'next/navigation';

// redirect /projects/[slug] to the chat page
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/projects/${slug}/chat`);
}

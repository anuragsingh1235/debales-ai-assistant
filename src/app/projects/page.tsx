'use client';

import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProject';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Bot, ArrowRight, Loader2 } from 'lucide-react';

export default function ProjectsPage() {
  const router = useRouter();
  const { data: authData, isLoading: authLoading, error: authError } = useAuth();
  const { data, isLoading, error } = useProjects();

  useEffect(() => {
    if (!authLoading && authError) {
      router.push('/login');
    }
  }, [authLoading, authError, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-violet-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-sm">
        Failed to load projects.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <span className="text-white font-semibold">Debales AI</span>
        </div>

        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {authData?.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-white/40 text-sm mt-1">Select a project to get started</p>
        </div>

        {data?.projects?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-sm">No projects assigned to you yet.</p>
          </div>
        ) : (
          <div data-testid="projects-list" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.projects?.map((project) => (
              <button
                key={project._id}
                data-testid={`project-card-${project.slug}`}
                onClick={() => router.push(`/projects/${project.slug}/chat`)}
                className="group p-6 bg-[#111118] border border-white/10 rounded-2xl text-left hover:border-violet-500/40 hover:bg-[#14141f] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
                    <Bot size={18} />
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-white/20 group-hover:text-violet-400 group-hover:translate-x-1 transition-all"
                  />
                </div>
                <h3 className="text-white font-semibold">{project.name}</h3>
                <p className="text-white/40 text-sm mt-1 line-clamp-2">{project.description}</p>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-[10px] text-white/25 bg-white/5 px-2 py-1 rounded-md">
                    {project.slug}
                  </span>
                  {project.members.find((m) => m.userId === authData?.user?._id)?.role === 'admin' && (
                    <span className="text-[10px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-md">
                      Admin
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

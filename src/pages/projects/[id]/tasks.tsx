import Layout from "@/components/Layout";
import { ProjectLayout } from "@/components/ProjectLayout";
import { useRouter } from "next/router";

export default function ProjectTasks() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout title="Project Tasks">
      <div className="max-w-5xl mx-auto">
        <ProjectLayout projectId={id as string} title="Tasks">
          <div className="p-6 text-gray-700">
            <h2 className="text-xl font-semibold mb-4">Project Tasks</h2>
            <p>Task management features coming soon.</p>
          </div>
        </ProjectLayout>
      </div>
    </Layout>
  );
}
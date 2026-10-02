import { getPlaybooks, getCategories, getAuthorityRules, getPolicies, getTools } from "@/lib/db-services";
import HomeClient from "@/components/home/HomeClient";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";

  const [playbooks, categories, authorityRules, policies, tools] = await Promise.all([
    getPlaybooks(),
    getCategories(),
    getAuthorityRules(),
    getPolicies(),
    getTools()
  ]);

  return (
    <HomeClient 
      query={query}
      playbooks={playbooks}
      categories={categories}
      authorityRules={authorityRules}
      policies={policies}
      tools={tools}
    />
  );
}

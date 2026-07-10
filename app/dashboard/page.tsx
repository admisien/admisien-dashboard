import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { fetchProgramsConfig } from "@/lib/data/fetchProgramsConfig";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.institucion) redirect("/login");

  const allProgramsConfig = await fetchProgramsConfig();
  const programsConfig = allProgramsConfig.filter((p) => p.institucion === session.user.institucion);

  return <DashboardClient institucion={session.user.institucion} programsConfig={programsConfig} />;
}

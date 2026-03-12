import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { hasPermission } from "@/config/permissions";
import DashboardClient from "./DashboardClient";

export default async function DashboardsPage() {
  const session = await getServerSession(authOptions);

  if(!session){
    redirect("/login");
  }

  if(!hasPermission(session.user.role, "dashboard")){
    redirect("/acesso-negado");
  }

  return <DashboardClient />;
}
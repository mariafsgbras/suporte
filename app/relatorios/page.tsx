import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { redirect } from "next/navigation";
import { hasPermission } from "@/config/permissions";
import RelatoriosClient from "./RelatoriosClient";

export default async function FormsPage() {
  const session = await getServerSession(authOptions);

  if(!session){
    redirect("/login");
  }

  if(!hasPermission(session.user.role, "relatorios")){
    redirect("/acesso-negado");
  }

  return <RelatoriosClient />;
}
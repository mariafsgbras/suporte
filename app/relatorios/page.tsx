import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
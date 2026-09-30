import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { redirect } from "next/navigation";
import { hasPermission } from "@/config/permissions";
import EmpresasClient from "./EmpresasClient";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if(!session){
    redirect("/login");
  }

  if(!hasPermission(session.user.role, "empresas")){
    redirect("/acesso-negado");
  }

  return <EmpresasClient />;
}
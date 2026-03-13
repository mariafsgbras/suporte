import { Suspense } from "react";
import ChamadosClient from "./ChamadosClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ChamadosClient />
    </Suspense>
  );
}
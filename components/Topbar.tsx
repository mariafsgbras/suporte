'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function Topbar() {
  const router = useRouter();

  return (
    <header className="h-14 bg-[#3f7a49] flex items-center justify-between px-4 text-white">
      <div className="flex">
        <Image
          src="/logo-sgbras.png"
          alt="SGBras"
          width={25}
          height={25}
          priority
        />
        <div className="font-semibold pl-4">
          SGBras Suporte
        </div>
      </div>
      
      <button 
        onClick={() => router.push('chamados/novo')}
        className="bg-white text-[#3f7a49] px-3 py-1 rounded text-sm">
        Abrir Novo Chamado
      </button>
    </header>
  );
}

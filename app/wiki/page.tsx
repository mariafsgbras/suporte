import { Layout } from "@/components/Layout";
import Image from "next/image";
import Link from "next/link";

export default function WikiPage() {
  return (
    <Layout>
      <h1 className="text-xl font-semibold text-gray-800 mb-2">
        Como podemos ajudar?
      </h1>

      <p className="text-gray-600 mb-6">
        Acesse nossa Wiki para visualizar informações e manuais dos nossos produtos.
      </p>

        <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Produtos
        </h1>
      <div className="grid grid-cols-4 gap-6">
        {/*<ProductCard 
            name="SW-403"
            image="/products/sw403mi.png"
            href="https://wiki.sgbras.com/pt-br/produtos/bloqueador"
        />*/}
        <ProductCard 
            name="Galileosky" 
            image="/products/galileosky.png"
            href="https://base.galileosky.com/articles/#!en-documentation/user-manuals"
        />
        {/*<ProductCard
            name="Cabo Serial"
            image="/products/cabo.png"
            href="https://wiki.sgbras.com/pt-br/produtos/RFID"
        />*/}
        <ProductCard
            name="Leitor RFID"
            image="/products/rfid.png"
            href="https://wiki.sgbras.com/pt-br/produtos/RFID"
        />
        <ProductCard
            name="NC-150"
            image="/products/nc150.png"
            href="https://wiki.sgbras.com/pt-br/produtos/nc150"
        />
        <ProductCard 
            name="Rotograma" 
            image="/products/rotograma.png"
            href="https://wiki.sgbras.com/pt-br/produtos/rotograma"
        />
        <ProductCard 
            name="Sensor de Fadiga" 
            image="/products/sf04a.png"
            href="https://wiki.sgbras.com/pt-br/produtos/sensor-de-fadiga-sf04a"
        />
        <ProductCard 
            name="Sensor de Temperatura por Sonda" 
            image="/products/sensor.png"
            href="https://wiki.sgbras.com/pt-br/produtos/sensor-temperatura-sonda"
        />
        <ProductCard 
            name="SW-101" 
            image="/products/sw101.png"
            href="https://wiki.sgbras.com/pt-br/produtos/sw101"
        />
      </div>

      <h1 className="text-xl font-semibold text-gray-800 mb-2 mt-8">
        Aplicativos
      </h1>
      <div className="grid grid-cols-4 gap-6">
        <ProductCard
            name="Localizador"
            image="/apps/localizador2.png"
            href="https://wiki.sgbras.com/pt-br/aplicativos/localizador"
        />
        <ProductCard 
            name="NC-150" 
            image="/apps/nc-150.png"
            href="https://wiki.sgbras.com/pt-br/aplicativos/app-nc150"
        />
        <ProductCard 
            name="Scanner" 
            image="/apps/scanner.png"
            href="https://wiki.sgbras.com/pt-br/aplicativos/sgbras-scanner"
        />
      </div>

      <h1 className="text-xl font-semibold text-gray-800 mb-2 mt-8">
        Ferramentas
      </h1>
      <div className="grid grid-cols-4 gap-6">
        <ProductCard
            name="Configurador SW-101"
            image="/tools/config-sw101-1.png"
            href="https://wiki.sgbras.com/pt-br/ferramentas/configurador-sw101"
        />
        <ProductCard
            name="Conversor RFID para iButton"
            image="/tools/conversor.png"
            href="https://wiki.sgbras.com/pt-br/ferramentas/conversor-rfid-ibutton"
        />
        <ProductCard 
            name="Gerador de comandos" 
            image="/tools/gerador-comandos.png"
            href="https://wiki.sgbras.com/pt-br/ferramentas/gerador-comandos-suntech"
        />
        <ProductCard 
            name="Modelo de SMS" 
            image="/tools/sms.png"
            href="https://wiki.sgbras.com/pt-br/ferramentas/sms"
        />
      </div>
    </Layout>
  );
}

function ProductCard({ 
    name,
    image,
    href,
    }: { name: string, image: string, href: string }) {
    return (
        <a 
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
        >
            <div className="h-52 border rounded p-4 flex flex-col items-center justify-between hover:shadow cursor-pointer">
                <Image
                    src={image}
                    alt={name}
                    width={180}
                    height={180}
                    className="mx-auto mb-2"
                />
                <span className="text-sm text-gray-700">{name}</span>    
            </div>
        </a>
    );
}
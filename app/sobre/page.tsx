"use client";

import { InstitutionalPage, Section } from "@/components/InstitutionalPage";
import { useBranding, useLoja } from "@/lib/hooks";

export default function SobrePage() {
  const loja = useLoja();
  const branding = useBranding();
  const nome = loja?.nome ?? "Nova Era Tintas";

  return (
    <InstitutionalPage
      title="Sobre Nós"
      breadcrumbLabel="Sobre Nós"
      subtitle="Tintas, pincéis, rolos e primers para sua obra."
    >
      <Section title={`Quem é a ${nome}`}>
        <p style={{ margin: 0 }}>
          {branding?.descricao ||
            `A ${nome} é uma loja especializada em materiais de pintura: tintas, pincéis, rolos e primers para deixar sua obra com o acabamento que você procura.`}
        </p>
      </Section>

      <Section title="Como funciona a compra">
        <p style={{ margin: 0 }}>
          Escolha os produtos, monte seu pedido e finalize via PIX. Depois de pagar, envie o comprovante
          pelo app — nossa equipe confere e aprova manualmente. Se algum item ou o frete precisar de
          ajuste, entramos em contato para negociar direto com você antes da confirmação final.
        </p>
      </Section>

      {(loja?.endereco || loja?.cidade || loja?.horarios) && (
        <Section title="Onde estamos">
          <p style={{ margin: 0 }}>
            {[loja?.endereco, loja?.cidade && loja?.estado ? `${loja.cidade} - ${loja.estado}` : loja?.cidade]
              .filter(Boolean)
              .join(", ")}
            {loja?.horarios && (
              <>
                <br />
                {loja.horarios}
              </>
            )}
          </p>
        </Section>
      )}
    </InstitutionalPage>
  );
}

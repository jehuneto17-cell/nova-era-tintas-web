"use client";

import { InstitutionalPage, Section } from "@/components/InstitutionalPage";
import { useLoja } from "@/lib/hooks";

export default function TermosPage() {
  const loja = useLoja();
  const nome = loja?.nome ?? "Nova Era Tintas";

  return (
    <InstitutionalPage
      title="Termos de Serviço"
      breadcrumbLabel="Termos de Serviço"
      subtitle="Condições de uso da loja virtual."
    >
      <Section title="1. Sobre o serviço">
        <p style={{ margin: 0 }}>
          A {nome} disponibiliza um catálogo de produtos para pintura, permitindo a montagem e o envio de
          pedidos através deste site.
        </p>
      </Section>

      <Section title="2. Pagamento">
        <p style={{ margin: 0 }}>
          Os pedidos são pagos via PIX. Após o pagamento, o cliente deve enviar o comprovante pelo site
          para conferência manual da loja. O pedido só é confirmado após a aprovação do comprovante.
        </p>
      </Section>

      <Section title="3. Negociação de pedidos">
        <p style={{ margin: 0 }}>
          A loja pode entrar em contato para negociar itens, quantidades ou valor de frete antes da
          confirmação final do pedido, sempre com o consentimento do cliente.
        </p>
      </Section>

      <Section title="4. Cancelamento">
        <p style={{ margin: 0 }}>
          Pedidos podem ser cancelados pelo cliente ou pela loja conforme o estado em que se encontram,
          respeitando o histórico e as políticas de cada etapa do processo de compra.
        </p>
      </Section>

      <Section title="5. Alterações">
        <p style={{ margin: 0 }}>
          Estes termos podem ser atualizados periodicamente. Recomendamos revisá-los de tempos em tempos.
        </p>
      </Section>
    </InstitutionalPage>
  );
}

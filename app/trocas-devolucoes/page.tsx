"use client";

import { InstitutionalPage, Section } from "@/components/InstitutionalPage";

export default function TrocasDevolucoesPage() {
  return (
    <InstitutionalPage
      title="Trocas e Devoluções"
      breadcrumbLabel="Trocas e Devoluções"
      subtitle="Como proceder caso precise trocar ou devolver um produto."
    >
      <Section title="Prazo para solicitar">
        <p style={{ margin: 0 }}>
          Você pode solicitar troca ou devolução em até 7 dias corridos após o recebimento do produto,
          conforme o Código de Defesa do Consumidor.
        </p>
      </Section>

      <Section title="Condições do produto">
        <p style={{ margin: 0 }}>
          O produto deve estar sem sinais de uso, com a embalagem original e, quando aplicável, lacrado —
          especialmente no caso de tintas já misturadas ou abertas, que não podem ser aceitas por questões
          de qualidade.
        </p>
      </Section>

      <Section title="Como solicitar">
        <p style={{ margin: 0 }}>
          Entre em contato pelo WhatsApp ou e-mail na página de{" "}
          <a href="/contato" style={{ color: "#0088B7" }}>
            Contato
          </a>{" "}
          informando o número do pedido e o motivo da troca/devolução. Nossa equipe vai orientar os
          próximos passos.
        </p>
      </Section>

      <Section title="Produto com defeito">
        <p style={{ margin: 0 }}>
          Se o produto chegou com defeito ou avaria, avise imediatamente pelos nossos canais de contato,
          preferencialmente com fotos, para agilizar a troca.
        </p>
      </Section>
    </InstitutionalPage>
  );
}

"use client";

import { InstitutionalPage, Section } from "@/components/InstitutionalPage";
import { brl } from "@/lib/store";
import { useFrete } from "@/lib/hooks";

export default function EnvioPage() {
  const frete = useFrete();

  return (
    <InstitutionalPage
      title="Envio"
      breadcrumbLabel="Envio"
      subtitle="Como calculamos e processamos a entrega do seu pedido."
    >
      <Section title="Valor do frete">
        <p style={{ margin: 0 }}>
          {frete
            ? `O frete padrão é de ${brl(frete.valor)}${
                frete.gratis_acima > 0 ? `. Pedidos acima de ${brl(frete.gratis_acima)} têm frete grátis` : ""
              }.`
            : "O valor do frete é exibido no checkout, antes da confirmação do pedido."}
        </p>
      </Section>

      <Section title="Quando o pedido é enviado?">
        <p style={{ margin: 0 }}>
          O envio começa depois que o pagamento é confirmado pela loja (após a conferência do
          comprovante de PIX). Você acompanha cada etapa — separação, envio e entrega — em "Meus
          Pedidos".
        </p>
      </Section>

      <Section title="Prazo de entrega">
        <p style={{ margin: 0 }}>
          O prazo varia de acordo com a sua região e a disponibilidade dos produtos. Em caso de dúvida
          sobre um pedido específico, fale com a gente pelo WhatsApp na página de{" "}
          <a href="/contato" style={{ color: "#0088B7" }}>
            Contato
          </a>
          .
        </p>
      </Section>
    </InstitutionalPage>
  );
}

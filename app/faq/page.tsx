"use client";

import { InstitutionalPage, Section } from "@/components/InstitutionalPage";
import { brl } from "@/lib/store";
import { useFrete, usePagamento } from "@/lib/hooks";

export default function FaqPage() {
  const pagamento = usePagamento();
  const frete = useFrete();

  return (
    <InstitutionalPage
      title="Perguntas Frequentes"
      breadcrumbLabel="FAQ"
      subtitle="Tire suas dúvidas sobre pedidos, pagamento e entrega."
    >
      <Section title="Como funciona o pagamento?">
        <p style={{ margin: 0 }}>
          O pagamento é feito via PIX. Depois de finalizar o pedido, você envia o comprovante pelo app e
          nossa equipe confere manualmente
          {pagamento?.pix_prazo_horas
            ? ` — normalmente em até ${pagamento.pix_prazo_horas}h.`
            : "."}
        </p>
      </Section>

      <Section title="Meu comprovante pode ser recusado?">
        <p style={{ margin: 0 }}>
          Sim, se houver alguma divergência na conferência
          {pagamento?.motivos_recusa?.length ? " (por exemplo: " + pagamento.motivos_recusa.join(", ") + ")" : ""}.
          Nesse caso você é avisado e pode reenviar o comprovante correto.
        </p>
      </Section>

      <Section title="Posso negociar itens ou frete do pedido?">
        <p style={{ margin: 0 }}>
          Sim. Alguns pedidos podem entrar em negociação — a loja entra em contato pelo WhatsApp para
          ajustar itens, quantidade ou valor do frete antes da confirmação final.
        </p>
      </Section>

      <Section title="Como funciona o frete?">
        <p style={{ margin: 0 }}>
          {frete
            ? `O frete padrão é de ${brl(frete.valor)}${
                frete.gratis_acima > 0 ? `, sendo grátis para pedidos acima de ${brl(frete.gratis_acima)}` : ""
              }.`
            : "O valor do frete é calculado no checkout, de acordo com seu pedido."}
        </p>
      </Section>

      <Section title="Como acompanho meu pedido?">
        <p style={{ margin: 0 }}>
          Acesse "Meus Pedidos" no seu perfil para ver o status atualizado — desde a conferência do
          pagamento até a entrega.
        </p>
      </Section>
    </InstitutionalPage>
  );
}

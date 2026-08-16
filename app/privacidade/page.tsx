"use client";

import { InstitutionalPage, Section } from "@/components/InstitutionalPage";
import { useLoja } from "@/lib/hooks";

export default function PrivacidadePage() {
  const loja = useLoja();
  const nome = loja?.nome ?? "Nova Era Tintas";

  return (
    <InstitutionalPage
      title="Política de Privacidade"
      breadcrumbLabel="Política de Privacidade"
      subtitle="Como tratamos os seus dados pessoais."
    >
      <Section title="1. Dados coletados">
        <p style={{ margin: 0 }}>
          Coletamos os dados necessários para processar seu cadastro e pedidos: nome, e-mail, telefone,
          endereços de entrega e, quando enviado, o comprovante de pagamento PIX.
        </p>
      </Section>

      <Section title="2. Uso dos dados">
        <p style={{ margin: 0 }}>
          Seus dados são usados exclusivamente para viabilizar a compra: conferência de pagamento,
          separação, envio do pedido e comunicação sobre o andamento (inclusive via WhatsApp, quando
          aplicável).
        </p>
      </Section>

      <Section title="3. Compartilhamento">
        <p style={{ margin: 0 }}>
          A {nome} não vende nem compartilha seus dados com terceiros para fins de marketing. Os dados
          ficam armazenados nos serviços de infraestrutura utilizados pela loja para operar o site e os
          pedidos.
        </p>
      </Section>

      <Section title="4. Seus direitos">
        <p style={{ margin: 0 }}>
          Você pode solicitar a atualização ou exclusão dos seus dados a qualquer momento, entrando em
          contato pelos canais da página de{" "}
          <a href="/contato" style={{ color: "#0088B7" }}>
            Contato
          </a>
          .
        </p>
      </Section>
    </InstitutionalPage>
  );
}

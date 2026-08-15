export interface ProdutoVariacao {
  cor: string;
  volume: string;
  preco: number;
  estoque: number;
  ativo: boolean;
}

export interface ProdutoCor {
  nome: string;
  hex: string;
}

export interface ProdutoSpec {
  nome: string;
  valor: string;
}

export interface ProdutoFoto {
  id: string;
  url: string;
}

export interface Produto {
  id: string;
  nome: string;
  categoriaId: string;
  categoria: string;
  descricao: string;
  limiteEstoqueBaixo: number;
  descontoPct: number;
  ativo: boolean;
  cores: ProdutoCor[];
  volumes: string[];
  variacoes: Record<string, ProdutoVariacao>;
  specs: ProdutoSpec[];
  fotos: ProdutoFoto[];
}

export interface Categoria {
  id: string;
  nome: string;
  icone: string;
  fotoUrl?: string;
  fundo: string;
  ordem: number;
  ativa: boolean;
  qtdProdutos: number;
}

export type PedidoEstado =
  | "em_negociacao"
  | "aguardando_pagamento"
  | "aguardando_confirmacao"
  | "pago"
  | "separacao"
  | "enviado"
  | "entregue"
  | "cancelado"
  | "expirado";

export interface PedidoItem {
  produtoId: string;
  nome: string;
  variacao: string;
  qtd: number;
  preco: number;
}

export interface PedidoHistoricoEntrada {
  tipo?: "estado" | "edicao";
  estado: string;
  quando: string;
  quem: string;
  observacao?: string;
  itensAnteriores?: PedidoItem[];
  freteAnterior?: number;
}

export interface Pedido {
  id: string;
  numero: string;
  clienteId: string;
  cliente: string;
  telefone: string;
  estado: PedidoEstado;
  criadoEm: string;
  itens: PedidoItem[];
  frete: number;
  endereco: string;
  enderecoMudou: boolean;
  historico: PedidoHistoricoEntrada[];
  comprovanteUrl?: string;
  comprovanteEnviadoEm?: string;
  valorComprovante?: number;
  ultimaRecusa?: PedidoUltimaRecusa;
}

export interface PedidoUltimaRecusa {
  motivo: string;
  quando: string;
  comprovanteUrl?: string;
}

export interface ClienteEndereco {
  id: string;
  rotulo: string;
  texto: string;
  principal: boolean;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  desde: string;
  enderecos: ClienteEndereco[];
  historicoEnderecos: string[];
}

export interface BrandingConfig {
  logo_url: string | null;
  banner_url: string | null;
  descricao: string;
  telefone: string;
  email: string;
  redes_sociais: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
}

export interface PagamentoConfig {
  pix_tipo: string;
  pix_chave: string;
  pix_recebedor: string;
  pix_qr_url?: string;
  pix_instrucoes: string;
  pix_prazo_horas: number;
  motivos_recusa: string[];
}

export interface WhatsappConfig {
  numero: string;
  mensagem: string;
}

export interface FreteConfig {
  valor: number;
  gratis_acima: number;
}

export interface BuscasConfig {
  termos: string[];
  mostrar: boolean;
}

export interface LojaConfig {
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  horarios: string;
}

export interface Cupom {
  id: string;
  codigo: string;
  tipo: "%" | "R$";
  valor: number;
  inicio: string;
  fim: string;
  limite: number | null;
  usos: number;
  ativo: boolean;
}

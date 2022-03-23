'use strict'
const listOfActions = [
  {
    action: 'welcome',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Boas vindas!',
      'en_us': 'Welcome!'
    }
  },
  {
    action: 'abandoned_cart',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Finalize suas compras!',
      'en_us': 'Complete your purchase'
    }
  },
  {
    action: 'new_order',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Pedido recebido com sucesso',
      'en_us': 'Order confirmed'
    }
  },
  {
    action: 'pending',
    templanteId: 3364381,
    subject: {
      'pt_br': 'O pagamento do seu pedido está pendente',
      'en_us': 'Pending payment'
    }
  },
  {
    action: 'delivered',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Seu pacote foi entregue!',
      'en_us': 'A shipment from your order has been delivered'
    }
  },
  {
    action: 'payment',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Seu pagamento foi aprovado!',
      'en_us': 'Payment accepted!'
    }
  },
  {
    action: 'shipped',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Seu pacote está a caminho!',
      'en_us': 'Your package is on the way!'
    }
  },
  {
    action: 'unauthorized',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Pagamento não autorizado',
      'en_us': 'Your payment is unauthorized'
    }
  },
  {
    action: 'voided',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Seu pedido foi cancelado',
      'en_us': 'Your order has been canceled'
    }
  },
  {
    action: 'under_analysis',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Seu pedido está em análise',
      'en_us': 'Request under review'
    }
  },
  {
    action: 'partially_paid',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Seu pedido foi parcialmente pago',
      'en_us': 'Order partially paid'
    }
  },
  {
    action: 'paid',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Seu pagamento foi aprovado!',
      'en_us': 'Your order is paid'
    }
  },
  {
    action: 'in_dispute',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Pagamento em disputa',
      'en_us': 'Payment in dispute'
    }
  },
  {
    action: 'partially_refunded',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Pagamento parcialmente estornado',
      'en_us': 'Partially reversed payment'
    }
  },
  {
    action: 'refunded',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Pagamento estornado',
      'en_us': 'Refunded Payment'
    }
  },
  {
    action: 'invoice_issued',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Nota Fiscal do seu pedido',
      'en_us': 'Invoice of your order'
    }
  },
  {
    action: 'in_production',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Seu pedido está em produção!',
      'en_us': 'Your order is in production'
    }
  },
  {
    action: 'in_separation',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Produto em separação',
      'en_us': 'Separating product(s)'
    }
  },
  {
    action: 'ready_for_shipping',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Seu pacote está pronto para o envio!',
      'en_us': 'Your order is ready for shipping'
    }
  },
  {
    action: 'partially_shipped',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Seu pedido foi parcialmente enviado',
      'en_us': 'Your order is partly shipped'
    }
  },
  {
    action: 'partially_delivered',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Seu pedido foi parcialmente entregue',
      'en_us': 'Your order is partially delivered'
    }
  },
  {
    action: 'returned_for_exchange',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Enviado para troca',
      'en_us': 'Sent for exchange'
    }
  },
  {
    action: 'received_for_exchange',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Pedido recebido para troca',
      'en_us': 'Order received for exchange'
    }
  },
  {
    action: 'returned',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Seu pedido foi retornado',
      'en_us': 'Your order has returned'
    }
  },
  {
    action: 'authorized',
    templanteId: 3364381,
    subject: {
      'pt_br': 'Seu pedido está autorizado!',
      'en_us': 'Your order is authorized'
    }
  }
]

const listOfCustomActions = [
  {
    name: 'Carrinho Abandonado',
    value: 'abandoned_cart'
  },
  {
    name: 'Novo Pedido',
    value: 'new_order'
  },
  {
    name: 'Pendente',
    value: 'pending'
  },
  {
    name: 'Sobre Analise',
    value: 'under_analysis'
  },
  {
    name: 'Autorizado',
    value: 'authorized'
  },
  {
    name: 'Não Autorizado',
    value: 'unauthorized'
  },
  {
    name: 'Pago',
    value: 'paid'
  },
  {
    name: 'Em Disputa',
    value: 'in_dispute'
  },
  {
    name: 'Devolvido',
    value: 'refunded'
  },
  {
    name: 'Cancelado',
    value: 'voided'
  },
  {
    name: 'Fatura Emitida',
    value: 'invoice_issued'
  },
  {
    name: 'Em Produção',
    value: 'in_production'
  },
  {
    name: 'Em Separação',
    value: 'in_separation'
  },
  {
    name: 'Pronto para Envio',
    value: 'ready_for_shipping'
  },
  {
    name: 'Enviado',
    value: 'shipped'
  },
  {
    name: 'Entregue',
    value: 'delivered'
  },
  {
    name: 'Voltou para Troca',
    value: 'returned_for_exchange'
  },
  {
    name: 'Recebido para Troca',
    value: 'received_for_exchange'
  },
  {
    name: 'Retornado',
    value: 'returned'
  }
]

const convertCustomAction = (status) => {
  return listOfCustomActions.find(action => action.value === status).name
}

module.exports = {
  listOfActions,
  listOfCustomActions,
  convertCustomAction
}

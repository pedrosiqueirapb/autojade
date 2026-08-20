/**
 * Integration with Asaas Payment Gateway (v3)
 */

export async function createAsaasCustomer(name: string): Promise<string> {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) {
    throw new Error('Chave de API do Asaas não configurada no servidor.');
  }

  const response = await fetch('https://api.asaas.com/v3/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': apiKey
    },
    body: JSON.stringify({ name: name.trim() })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Asaas customer creation failed:", errorText);
    throw new Error(`Erro ao cadastrar cliente no Asaas: ${errorText}`);
  }

  const data = await response.json();
  return data.id; // e.g. "cus_000005719b79"
}

export async function createAsaasPayment(clientName: string, description: string, value: number, billingType?: 'single' | 'recurrent'): Promise<string> {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) {
    throw new Error('Chave de API do Asaas não configurada no servidor.');
  }

  const isRecurrent = billingType === 'recurrent';

  const bodyData: Record<string, string | number | boolean> = {
    name: `${clientName} - ${description.substring(0, 50)}`,
    description: description.substring(0, 255).trim(),
    billingType: 'CREDIT_CARD',
    value: Number(value.toFixed(2)),
    notificationEnabled: false
  };

  if (isRecurrent) {
    bodyData.chargeType = 'RECURRENT';
    bodyData.subscriptionCycle = 'MONTHLY';
  } else {
    bodyData.chargeType = 'INSTALLMENT';
    bodyData.maxInstallmentCount = 7;
  }

  const response = await fetch('https://api.asaas.com/v3/paymentLinks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': apiKey
    },
    body: JSON.stringify(bodyData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Asaas payment link creation failed:", errorText);
    throw new Error(`Erro ao criar link de pagamento no Asaas: ${errorText}`);
  }

  const data = await response.json();
  return data.url; // Returns the public payment link URL supporting installments
}

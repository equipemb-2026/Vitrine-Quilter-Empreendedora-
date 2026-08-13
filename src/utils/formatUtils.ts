/**
 * Utilitários de formatação para a Vitrine Quilter Empreendedora 2026
 */

/**
 * Formata um valor numérico para o padrão de moeda brasileira (R$ 550,00)
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return 'R$ 0,00';
  }

  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.,]/g, '').replace(',', '.'));

  if (isNaN(numericValue)) {
    return 'R$ 0,00';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

/**
 * Formata um CEP para o padrão 00000-000
 */
export function formatCep(cep: string | null | undefined): string {
  if (!cep) return '';
  const digits = cep.replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return cep;
}

/**
 * Formata telefone para exibição amigável
 */
export function formatPhoneDisplay(phone: string | null | undefined): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  // Remove o código do país 55 se houver para exibir mais amigável
  const localDigits = digits.startsWith('55') && digits.length >= 12 ? digits.slice(2) : digits;
  if (localDigits.length === 11) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 7)}-${localDigits.slice(7)}`;
  }
  if (localDigits.length === 10) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 6)}-${localDigits.slice(6)}`;
  }
  return phone;
}

/**
 * Limita o tamanho do texto para o resumo do card com reticências limpas
 */
export function truncateText(text: string, maxLength: number = 110): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

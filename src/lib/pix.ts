/**
 * Generates a valid static PIX Copy and Paste (BR Code) string
 * based on the Central Bank (BACEN) / EMV Specifications.
 */
export function generatePixPayload(key: string, name: string, city: string, value: number, txid: string = '***'): string {
  // Helper to format fields: ID + Length + Value
  const formatField = (id: string, val: string): string => {
    const len = val.length.toString().padStart(2, '0');
    return id + len + val;
  };

  // Normalize string (uppercase, no accents, alphanumeric and spaces only)
  const normalize = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, '') // Keep letters, digits, and spaces
      .replace(/\s+/g, ' '); // Normalize spaces
  };

  // 1. Payload Format Indicator (ID 00)
  const payloadFormat = formatField('00', '01');

  // 2. Merchant Account Information (ID 26)
  const gui = formatField('00', 'br.gov.bcb.pix');
  const keyField = formatField('01', key.trim());
  const merchantInfo = formatField('26', gui + keyField);

  // 3. Merchant Category Code (ID 52)
  const categoryCode = formatField('52', '0000');

  // 4. Transaction Currency (ID 53) - ISO 4217 code for BRL is 986
  const currencyCode = formatField('53', '986');
  
  // 5. Transaction Amount (ID 54) - 2 decimal digits
  const valueStr = value.toFixed(2);
  const amount = formatField('54', valueStr);
  
  // 6. Country Code (ID 58)
  const countryCode = formatField('58', 'BR');
  
  // 7. Merchant Name (ID 59) - Max 25 chars
  const normalizedName = normalize(name).substring(0, 25).trim();
  const merchantName = formatField('59', normalizedName);
  
  // 8. Merchant City (ID 60) - Max 15 chars
  const normalizedCity = normalize(city).substring(0, 15).trim();
  const merchantCity = formatField('60', normalizedCity);

  // 9. Additional data field (ID 62) - Reference Label / TxId (ID 05)
  const cleanTxId = normalize(txid).replace(/\s/g, '').substring(0, 25);
  const txidField = formatField('05', cleanTxId || '***');
  const additionalData = formatField('62', txidField);

  // Assemble full string up to CRC template (ID 63 with length 04)
  const fullStringBeforeCRC = payloadFormat + merchantInfo + categoryCode + currencyCode + amount + countryCode + merchantName + merchantCity + additionalData + '6304';
  
  // Calculate CRC16-CCITT (polynomial 0x1021, initial value 0xFFFF)
  let crc = 0xFFFF;
  for (let i = 0; i < fullStringBeforeCRC.length; i++) {
    const charCode = fullStringBeforeCRC.charCodeAt(i);
    crc ^= (charCode << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = (crc << 1);
      }
    }
  }
  const crcHex = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  
  return fullStringBeforeCRC + crcHex;
}

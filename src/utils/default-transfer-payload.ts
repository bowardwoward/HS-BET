export const defaultTransferPayload = (accountNumber: string) => {
  return {
    transactionType: 'TRANSFER-SEND',
    transactionDate: new Date().toISOString().split('T')[0],
    transactionDescription: 'Transfer from ' + accountNumber,
    transactionReferrenceNumber: 'OOGABOOGA',
    transactionChannel: 'INSTAPAY',
    transactionCode: '000000',
    fee: '0',
  };
};

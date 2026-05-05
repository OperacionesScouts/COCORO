'use server';
/**
 * @fileOverview A Genkit flow for analyzing payment receipts using AI.
 *
 * - adminPaymentReceiptAnalysis - A function that handles the AI analysis of payment receipts.
 * - PaymentReceiptAnalysisInput - The input type for the adminPaymentReceiptAnalysis function.
 * - PaymentReceiptAnalysisOutput - The return type for the adminPaymentReceiptAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PaymentReceiptAnalysisInputSchema = z.object({
  receiptImageDataUri: z
    .string()
    .describe(
      "A payment receipt image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PaymentReceiptAnalysisInput = z.infer<typeof PaymentReceiptAnalysisInputSchema>;

const PaymentReceiptAnalysisOutputSchema = z.object({
  paymentReference: z
    .string()
    .describe(
      'The transaction ID, reference number, or any unique identifier for the payment extracted from the receipt. Use "N/A" if not found.'
    ),
  amount: z
    .number()
    .describe('The total amount paid extracted from the receipt. Use 0 if not found.'),
  paymentDate: z
    .string()
    .describe(
      'The date the payment was made extracted from the receipt, in YYYY-MM-DD format. Use "N/A" if not found.'
    ),
});
export type PaymentReceiptAnalysisOutput = z.infer<typeof PaymentReceiptAnalysisOutputSchema>;

export async function adminPaymentReceiptAnalysis(
  input: PaymentReceiptAnalysisInput
): Promise<PaymentReceiptAnalysisOutput> {
  return adminPaymentReceiptAnalysisFlow(input);
}

const adminPaymentReceiptAnalysisPrompt = ai.definePrompt({
  name: 'adminPaymentReceiptAnalysisPrompt',
  input: {schema: PaymentReceiptAnalysisInputSchema},
  output: {schema: PaymentReceiptAnalysisOutputSchema},
  prompt: `You are an expert financial assistant. Your task is to extract payment details from an uploaded payment receipt image.\n\nExtract the following information:\n1.  **Payment Reference**: The transaction ID, reference number, or any unique identifier for the payment.\n2.  **Amount**: The total amount paid.\n3.  **Payment Date**: The date the payment was made, in YYYY-MM-DD format.\n\nIf any information is not clearly visible or present, use "N/A" for strings and 0 for numbers, as specified in the output schema description.\n\nPayment Receipt: {{media url=receiptImageDataUri}}`,
});

const adminPaymentReceiptAnalysisFlow = ai.defineFlow(
  {
    name: 'adminPaymentReceiptAnalysisFlow',
    inputSchema: PaymentReceiptAnalysisInputSchema,
    outputSchema: PaymentReceiptAnalysisOutputSchema,
  },
  async input => {
    const {output} = await adminPaymentReceiptAnalysisPrompt(input);
    return output!;
  }
);

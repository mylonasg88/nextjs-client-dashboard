import { sql } from '@vercel/postgres';
import { z } from 'zod';

interface CreateInvoiceParams {
  userId: string;
  amount: number;
  status: 'pending' | 'paid';
}

export const customerFormSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }),
  amount: z.number().min(1, { message: 'Amount must be greater than 0' }),
  status: z.enum(['pending', 'paid'], { message: "Status must be either 'pending' or 'paid'" }),
});

export type CustomerFormSchema = z.infer<typeof customerFormSchema>;

export async function createInvoice2(formData: FormData) {
  const userId = formData.get('userId')?.toString() || '';
  const amount = formData.get('amount');
  const status = formData.get('status')?.toString() || '';

  const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : 0;

  // Prepare data for validation and creation
  const invoiceData = {
    userId,
    amount: parsedAmount,
    status,
  };

  // Validate input data using Zod
  const validationResult = customerFormSchema.safeParse(invoiceData);

  if (!validationResult.success) {
    throw new Error('Validation error: ' + validationResult.error.errors.map((err) => err.message).join(', '));
  }

  try {
    const { userId, amount, status } = validationResult.data;
    // Insert invoice data into the database using @vercel/postgres
    await sql`
      INSERT INTO invoices (user_id, amount, status)
      VALUES (${userId}, ${amount}, ${status})
    `;

    return { success: true };
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw new Error('Error creating invoice');
  }
}

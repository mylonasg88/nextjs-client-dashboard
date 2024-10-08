'use server';

import fs from 'node:fs/promises';
import { QueryResult, QueryResultRow, sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type State = {
  message?: null | string;
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  success?: boolean;
};

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CustomerSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  imageUrl: z
    .any()
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, { message: 'Max size of file is 5MB' })
    .refine(
      (file) => {
        if (file.size > 0) {
          return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
        }

        return true;
      },
      {
        message: 'Only .jpg , .png , .webp formats are allowed',
      },
    ),
  isDeleted: z.boolean(),
});

const CreateInvoiceSchema = InvoiceSchema.omit({ id: true, date: true });

export async function createInvoice(_: State, formData: FormData) {
  const validatedFields = CreateInvoiceSchema.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      // errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice',
      success: false,
    };
  }

  const amountInCents = validatedFields.data.amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date) 
      VALUES (${validatedFields.data.customerId}, ${amountInCents}, ${validatedFields.data.status}, ${date})
      `;

    return { success: true, message: 'Success' }; // Here I should redirect user to Invoices page.
  } catch (err) {
    console.log('Some error happened in the database.');

    return {
      message: 'Failed to create invoice. Error',
      success: false,
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

const UpdateInvoiceSchema = InvoiceSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoiceSchema.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;
  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to update invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
  } catch (err) {
    console.log('Error: ', err);

    return {
      message: 'Database Error: Failed to delete invoice.',
    };
  }
}

const CreateCustomerSchema = CustomerSchema.omit({ id: true, isDeleted: true });

export async function createCustomer(formData: FormData) {
  try {
    const { firstName, lastName, email } = CreateCustomerSchema.partial({
      imageUrl: true,
    }).parse({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
    });

    const file = formData.get('profileImage') as File;
    let fileName = '';

    if (file.size > 1) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      await fs.writeFile(`./public/customers/${file.name}`, buffer);
      fileName = `/customers/${file.name}`;
    }

    await sql`
    INSERT INTO customers (name, email, image_url)
    VALUES (${firstName + ' ' + lastName}, ${email}, ${fileName})
  `;

    revalidatePath('/dashboard/customers');
    redirect('/dashboard/customers');
  } catch (err) {
    console.log('Failed to create a customer. Error:', err);
  }
}

export async function deleteCustomer(customerId: string) {
  console.log('deleteCustomer - customerId : ', customerId);

  try {
    await sql`UPDATE customers SET is_deleted = TRUE WHERE id = ${customerId}`;
  } catch (err) {
    console.log('Customer deletion failed. Error: ', err);
    throw new Error('Failed to delete a customer');
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function disableCustomer(customerId: string) {
  try {
    await sql`UPDATE customers SET is_disabled = TRUE WHERE id = ${customerId}`;
  } catch (err) {
    console.log('Customer disable failed. Error: ', err);
    throw new Error('Failed to disable a customer');
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function updateCustomer(customerId: string, formData: FormData) {
  try {
    const { firstName, lastName, email } = CreateCustomerSchema.partial({
      imageUrl: true,
    }).parse({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
    });

    const file = formData.get('profileImage') as File;
    let fileName = '';

    if (file.size > 1) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      await fs.writeFile(`./public/customers/${file.name}`, buffer);
      fileName = `/customers/${file.name}`;
    }

    await sql`UPDATE customers 
    SET email = ${email}, name = ${firstName + ' ' + lastName}, image_url = ${fileName}
    WHERE id = ${customerId}
  `;
  } catch (err) {
    console.log('Customer update failed. Error:', err);
    throw new Error('Failed to update customer.');
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

// ===============================

const invoiceFormSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }),
  // amount: z.string(), //.min(1, { message: 'Amount must be greater than 0' }),
  // status: z.string(), //enum(['pending', 'paid'], { message: "Status must be either 'pending' or 'paid'" }),
});

// export type InvoiceFormSchema = z.infer<typeof invoiceFormSchema>;

export async function createInvoice2(formData: FormData) {
  console.log('formData : ', formData);
  const userId = formData.get('userId')?.toString() || '';
  const amount = formData.get('amount')?.toString();
  const status = formData.get('status')?.toString() || '';

  const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : 0;

  // Prepare data for validation and creation
  const invoiceData = {
    userId,
    amount: parsedAmount,
    status,
  };

  try {
    // Validate input data using Zod
    const validationResult = invoiceFormSchema.safeParse(invoiceData);

    if (!validationResult.success) {
      throw new Error('Validation error: ' + validationResult.error.errors.map((err) => err.message).join(', '));
    }

    // const { userId, amount, status } = validationResult.data;
    const { userId } = validationResult.data;
    // Insert invoice data into the database using @vercel/postgres
    await sql`
      INSERT INTO invoices (customer_id, amount, status)
      VALUES (${userId}, ${amount}, ${status})
    `;

    return { success: true };
  } catch (error) {
    console.error('Error creating invoice:', error.message);

    // throw new Error("Error creating invoice");
    return { message: 'Error' };
  }
}

interface InvoiceType2 {
  customerId: string;
  amount: number;
  status: 'paid' | 'pending';
  date: string;
}

const invoiceFormSchema2 = z.object({
  customerId: z.string().uuid('Specified ID was incorrect.'),
  amount: z.coerce.number().gt(0, { message: 'Please specify an amount greater than 0.' }),
  status: z.enum(['paid', 'pending'], { message: 'Incorrect invoice status.' }),
  // date: z.date().optional(),
});

export const createInvoice3 = async (_: State, formData: FormData) => {
  console.log('formData: ', formData);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const result = invoiceFormSchema2.safeParse({
      customerId: formData.get('customerId'),
      status: formData.get('status'),
      amount: formData.get('amount'),
    });

    if (!result.success) {
      return {
        d: 'hello',
        message: 'Could not validate form',
        errors: result.error.flatten().fieldErrors,
        success: false,
      };
    }

    return { success: false, message: 'Success' }; // Here I should redirect user to Invoices page.
  } catch (error) {
    // console.log('error', error.message);
    // Log to Sentry

    return { message: 'Could not save to database.', success: false, details: 'hello world' };
  }
};

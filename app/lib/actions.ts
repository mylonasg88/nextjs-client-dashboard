'use server';
import fs from 'node:fs/promises';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { custom, z } from 'zod';

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
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

export async function createInvoice(formData: FormData) {
  const rawFormData = CreateInvoiceSchema.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = rawFormData.amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date) 
    VALUES (${rawFormData.customerId}, ${amountInCents}, ${rawFormData.status}, ${date})
  `;

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
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}

const CreateCustomerSchema = CustomerSchema.omit({ id: true, isDeleted: true });

export async function createCustomer(formData: FormData) {
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
}

export async function deleteCustomer(customerId: string) {
  console.log('customerId : ', customerId);

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

    // revalidatePath('/dashboard/customers');
    // redirect('/dashboard/customers');
  } catch (err) {
    console.log('Customer update failed. Error:', err);
    throw new Error('Failed to update customer.');
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

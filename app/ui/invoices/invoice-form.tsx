'use client';

import { useActionState, useEffect, useState } from 'react';

import { Button } from '../components/button';

import { createInvoice3, State } from '@/app/lib/actions';
import { CustomerField } from '@/app/lib/definitions';

interface InvoiceFormProps {
  customers: CustomerField[];
}

export default function InvoiceForm({ customers }: InvoiceFormProps) {
  const initialState: State = { message: null, errors: {} };
  const [errors, formAction, isPending] = useActionState(createInvoice3, initialState);
  const [success, setSuccess] = useState<null | boolean>(null);

  useEffect(() => {
    console.log('You had some errors.', errors);
    if (errors?.success) setSuccess(true);
    else setSuccess(false);
  }, [errors]);

  useEffect(() => {
    console.log('isPending : ', isPending);
  }, [isPending]);

  return (
    <form action={formAction}>
      {isPending && <h4 className="text-blue-500">Saving...</h4>}
      {success ? (
        <h4 className="text-md text-green-700 p-2 w-fit rounded-xl bg-slate-300 block">
          Invoice was saved successfully
        </h4>
      ): <h4 className="text-md font-thin text-red-700 p-2 w-fit rounded-xl bg-slate-300 block">
      Something didn't work..
    </h4> } 
      <div className="mt-4">
        <label htmlFor="customerId">User ID:</label>
        <select id="customerId" name="customerId" required>
          <option value="">Select a user</option>
          {customers?.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="amount">Amount:</label>
        <input type="number" id="amount" name="amount" min={1} />
      </div>

      <div>
        <label htmlFor="status">Status:</label>
        <select id="status" name="status" required>
          <option value="">Select status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <Button>Create Invoice</Button>
    </form>
  );
}

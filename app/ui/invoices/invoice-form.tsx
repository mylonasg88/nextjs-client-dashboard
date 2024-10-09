'use client';

import { useActionState, useEffect, useState } from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { ZodError } from 'zod';

import { Button } from '../components/button';

import { createInvoice3, State } from '@/app/lib/actions';
import { CustomerField } from '@/app/lib/definitions';

interface InvoiceFormProps {
  customers: CustomerField[];
}

export default function InvoiceForm({ customers }: InvoiceFormProps) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(createInvoice3, initialState);
  const [success, setSuccess] = useState<null | boolean>(null);

  useEffect(() => {
    // Check for propeties in the state.
    console.log('You had some errors.', state);
    if (state?.success) setSuccess(true);
  }, [state]);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6 mt-10 w-1/3 min-w-fit">
        {isPending && <h4 className="text-blue-500">Saving...</h4>}
        {success === true ? (
          <h4 className="text-md text-green-700 p-2 w-fit rounded-xl bg-slate-300 block">
            Invoice was saved successfully
          </h4>
        ) : success === false ? (
          <h4 className="text-md font-thin text-red-700 p-2 w-fit rounded-xl bg-slate-300 block">
            Something didn't work..
          </h4>
        ) : null}
        <div className="mb-4">
          <label htmlFor="customerId" className="text-sm font-medium mb-2 block">
            Select a customer:
          </label>
          <div className="relative">
            <select
              id="customerId"
              name="customerId"
              className="peer w-full rounded-md border-gray-200 cursor-pointer text-sm placeholder:text-gray-500"
            >
              <option value="">Select a user</option>
              {customers?.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <ErrorMessenger errors={state.errors} fieldName="customerId" />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium" htmlFor="amount">
            Amount:
          </label>
          <div className="relative rounded-md">
            <input
              placeholder="Enter USD amount"
              className="peer block w-full rounded-md border border-gray-200 pl-10 text-sm outline-2 placeholder:text-gray-500"
              type="number"
              id="amount"
              name="amount"
              min={1}
            />
            <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <ErrorMessenger errors={state.errors} fieldName="amount" />
        </div>

        <div className="mb-4">
          <label htmlFor="status" className="mb-2 block text-sm font-medium">
            Status:
          </label>
          <select
            id="status"
            name="status"
            className="peer w-full text-sm rounded-md border border-gray-200 bg-white min-w-[164px]"
          >
            <option value="">Select status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
          <ErrorMessenger errors={state.errors} fieldName="status" />
        </div>

        <div className="flex justify-end">
          <Button>Create Invoice</Button>
        </div>
      </div>
    </form>
  );
}

type ErrorMessengerType = {
  errors: { [key: string]: string[] } | undefined;
  fieldName: string;
};

const ErrorMessenger = ({ errors, fieldName }: ErrorMessengerType) => {
  if (!errors) return null;
  if (!errors[fieldName]) return null;

  return <p className="text-red-500 text-sm mt-2"> {errors?.[fieldName]?.[0]}</p>;
};

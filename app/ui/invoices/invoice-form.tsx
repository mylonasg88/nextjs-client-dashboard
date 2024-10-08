'use client';

import { useActionState, useEffect, useState } from 'react';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

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
    console.log(errors.errors);
    if (errors?.success) setSuccess(true);
    else setSuccess(false);
  }, [errors]);

  useEffect(() => {
    console.log('isPending : ', isPending);
  }, [isPending]);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {isPending && <h4 className="text-blue-500">Saving...</h4>}
        {success ? (
          <h4 className="text-md text-green-700 p-2 w-fit rounded-xl bg-slate-300 block">
            Invoice was saved successfully
          </h4>
        ) : (
          <h4 className="text-md font-thin text-red-700 p-2 w-fit rounded-xl bg-slate-300 block">
            Something didn't work..
          </h4>
        )}
        <div className="mb-4">
          <label htmlFor="customerId">User ID:</label>
          <div className="relative">
            <select id="customerId" name="customerId">
              <option value="">Select a user</option>
              {customers?.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <ErrorMessenger errors={errors} fieldName="customerId" />
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
          <ErrorMessenger errors={errors} fieldName="amount" />
          {/* {errors?.errors?.amount && <p className="text-red-500 text-sm">{errors?.errors?.amount[0]}</p>} */}
        </div>

        <div className="mb-4">
          <label htmlFor="status">Status:</label>
          <select id="status" name="status">
            <option value="">Select status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
          <ErrorMessenger errors={errors} fieldName="status" />
          {/* {errors?.errors?.status && <p className="text-red-500 text-sm">{errors?.errors?.status[0]}</p>} */}
        </div>

        <Button>Create Invoice</Button>
      </div>
    </form>
  );
}

type ErrorMessengerType = {
  errors: { [key: string]: Array<string> };
  fieldName: string;
};

const ErrorMessenger = ({errors, fieldName}: ErrorMessengerType ) => {
  if (!errors) return null;
  if (!errors?.errors?.[fieldName]) return null;

  return <p className="text-red-500 text-sm mt-2">{errors?.errors[fieldName][0]}</p>;
};

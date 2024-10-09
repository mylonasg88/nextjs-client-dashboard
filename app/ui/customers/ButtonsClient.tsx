'use client';

import { ArchiveBoxArrowDownIcon } from '@heroicons/react/24/outline';
import { MouseEvent, useState } from 'react';

import ConfirmDialog from '@/app/ui/components/confirmDialog';
import { disableCustomer } from '@/app/lib/actions';

export function DeleteCustomer({ customerId, isDisabled = false }: { customerId: string; isDisabled?: boolean }) {
  const disableCustomerWithId = disableCustomer.bind(null, customerId);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // e.preventDefault(); // this is required only when button is type='submit' which is the default type.
    setIsOpen(true);
  };

  return (
    <form>
      <button
        type="button"
        className={`border p-2 rounded-md ${isDisabled && 'opacity-50'}`}
        onClick={handleClick}
        disabled={isDisabled}
      >
        <span className="sr-only">Delete</span>
        <ArchiveBoxArrowDownIcon className="w-5" />
      </button>
      <ConfirmDialog
        isOpen={isOpen}
        onConfirm={() => {
          disableCustomerWithId();
          setIsOpen(false);
        }}
        onCancel={() => setIsOpen(false)}
      />
    </form>
  );
}

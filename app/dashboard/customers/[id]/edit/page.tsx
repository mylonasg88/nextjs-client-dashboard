import { notFound } from 'next/navigation';

import { fetchCustomer } from '@/app/lib/data';
import EditCustomerForm from '@/app/ui/customers/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';

export default async function Page({ params }: { params: { id: string } }) {
  const customer = await fetchCustomer(params.id);

  if (!customer) notFound();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Customers', href: '/dashboard/customers' },
          {
            label: 'Edit Customer',
            href: `/dashboard/customers/${params.id}/edit`,
            active: true,
          },
        ]}
      />
      <EditCustomerForm customerId={params.id} />
    </main>
  );
}

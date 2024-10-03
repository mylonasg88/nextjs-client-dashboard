import { Suspense } from 'react';

import Search from '@/app/ui/search';
import Table, { CustomerTablePagination } from '@/app/ui/customers/table';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton, PaginationSkeleton } from '@/app/ui/skeletons';
import { CreateCustomer } from '@/app/ui/customers/buttons';

export default async function Page({ searchParams }: { searchParams?: { query?: string; page?: string } }) {
  const query = searchParams?.query || '';
  const page = Number(searchParams?.page) || 1;

  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>Customers</h1>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search customers..." searchParamsServer={query} />
        <CreateCustomer />
      </div>
      <Suspense key={query} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={page} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Suspense key={Math.random()} fallback={<PaginationSkeleton />}>
          <CustomerTablePagination query={query} />
        </Suspense>
      </div>
    </div>
  );
}

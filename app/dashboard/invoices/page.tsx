import { Suspense } from 'react';

import InvoicesTablePagination from '@/app/ui/invoices/table-pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton, PaginationSkeleton } from '@/app/ui/skeletons';

export default async function Page({ searchParams, ...props }: { searchParams?: { query?: string; page?: string } }) {
  const query = searchParams?.query || '';
  const page = Number(searchParams?.page) || 1;

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." searchParamsServer={query} />
        <CreateInvoice />
      </div>
      <Suspense key={query} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={page} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Suspense key={Math.random()} fallback={<PaginationSkeleton />}>
          <InvoicesTablePagination query={query} />
        </Suspense>
      </div>
    </div>
  );
}

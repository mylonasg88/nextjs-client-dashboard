import { fetchInvoicesPagination } from '@/app/lib/data';
import Pagination from '@/app/ui/global/pagination';

export default async function InvoicesTablePagination({ query }: { query: string }) {
  const totalPages = await fetchInvoicesPagination(query);

  return <Pagination totalPages={totalPages} />;
}

import { fetchInvoicesPages } from '@/app/lib/data';
import Pagination from '@/app/ui/global/pagination';

export default async function InvoicesTablePagination({ query }: { query: string }) {
  const totalPages = await fetchInvoicesPages(query);

  return <Pagination totalPages={totalPages} />;
}

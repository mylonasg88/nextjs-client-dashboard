import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import Notifications from '@/app/ui/settings/notifications';

export default function Page() {
  return (
    <>
      <main>
        <Breadcrumbs
          breadcrumbs={[
            {
              label: 'Settings',
              href: '/dashboard/settings',
              active: true,
            },
          ]}
        />
      </main>
      <Notifications />
    </>
  );
}

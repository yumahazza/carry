'use client';

import { useParams } from 'next/navigation';
import AdminCarForm from '@/components/AdminCarForm';

export default function AdminEditCarPage() {
  const params = useParams();
  const id = params.id as string;

  return <AdminCarForm mode="edit" carId={id} />;
}


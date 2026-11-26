import type { CanonicalBookingStatus } from '@/lib/format';

const BOOKING_BADGE_MAP: Record<
  CanonicalBookingStatus,
  { label: string; className: string }
> = {
  PENDING: { label: 'Pending', className: 'status-warning' },
  APPROVED: { label: 'Approved', className: 'status-success' },
  COMPLETED: { label: 'Completed', className: 'status-info' },
  CANCELLED: { label: 'Cancelled', className: 'status-danger' },
  REJECTED: { label: 'Rejected', className: 'status-danger' },
};

export function BookingStatusBadge({ status }: { status: string }) {
  const normalized = status?.toUpperCase() as CanonicalBookingStatus;
  const config = BOOKING_BADGE_MAP[normalized] ?? {
    label: status || 'Unknown',
    className: 'status-neutral',
  };

  return <span className={`status-badge ${config.className}`}>{config.label}</span>;
}

export function CarAvailabilityBadge({ isAvailable }: { isAvailable: boolean }) {
  return (
    <span className={`status-badge ${isAvailable ? 'status-success' : 'status-danger'}`}>
      {isAvailable ? 'Available' : 'Rented'}
    </span>
  );
}

import type { Order } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export function canViewOrderInvoice(
  order: Order,
  user: User | null,
  options?: { sessionId?: string; email?: string }
): boolean {
  if (user?.id && order.user_id === user.id) return true;

  if (
    options?.sessionId &&
    order.stripe_session_id &&
    order.stripe_session_id === options.sessionId
  ) {
    return true;
  }

  const email = options?.email?.trim().toLowerCase();
  if (email && order.customer_email?.toLowerCase() === email) {
    return true;
  }

  return false;
}

export function invoiceAccessQuery(order: Order): string {
  if (order.stripe_session_id) {
    return `session_id=${encodeURIComponent(order.stripe_session_id)}`;
  }
  if (order.customer_email) {
    return `email=${encodeURIComponent(order.customer_email)}`;
  }
  return "";
}

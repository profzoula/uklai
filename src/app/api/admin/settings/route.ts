import { NextResponse } from "next/server";
import {
  getStoreSettings,
  saveStoreSettings,
  defaultStoreSettings,
} from "@/lib/store-settings";
import type { AllStoreSettings } from "@/lib/store-settings-types";

export async function GET() {
  const settings = await getStoreSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  let body: Partial<AllStoreSettings>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const current = await getStoreSettings();
  const merged: AllStoreSettings = {
    store: { ...current.store, ...body.store },
    payment: { ...current.payment, ...body.payment },
    shipping: { ...current.shipping, ...body.shipping },
    tax: { ...current.tax, ...body.tax },
    notifications: { ...current.notifications, ...body.notifications },
  };

  const { error } = await saveStoreSettings(merged);
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(merged);
}

export async function POST() {
  const { error } = await saveStoreSettings(defaultStoreSettings);
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(defaultStoreSettings);
}

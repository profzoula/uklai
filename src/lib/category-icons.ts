import type { LucideIcon } from "lucide-react";
import {
  Armchair,
  Cpu,
  Gamepad2,
  Headphones,
  Keyboard,
  Laptop,
  Monitor,
  Network,
  Package,
  Printer,
  Smartphone,
  Tablet,
  Tv,
  Usb,
  Watch,
  Wifi,
} from "lucide-react";

function matchCategory(key: string): LucideIcon | null {
  if (/laptop|notebook|macbook|apple/.test(key)) return Laptop;
  if (/monitor|display|screen/.test(key)) return Monitor;
  if (/keyboard|mouse|peripheral/.test(key)) return Keyboard;
  if (/gaming|game|chair/.test(key)) return Gamepad2;
  if (/pc component|component|desktop|cpu|motherboard/.test(key)) return Cpu;
  if (/accessor|usb|card reader|adapter|cable/.test(key)) return Usb;
  if (/network|router|wifi|ethernet/.test(key)) return Network;
  if (/phone|cell|mobile|smartphone/.test(key)) return Smartphone;
  if (/tablet|ipad|ebook/.test(key)) return Tablet;
  if (/printer|ink/.test(key)) return Printer;
  if (/headphone|audio|speaker|webcam|microphone/.test(key)) return Headphones;
  if (/smart home|home|furniture/.test(key)) return Armchair;
  if (/watch|wearable/.test(key)) return Watch;
  if (/tv|television/.test(key)) return Tv;
  if (/wifi/.test(key)) return Wifi;
  return null;
}

export function getCategoryIcon(slug: string, name: string): LucideIcon {
  const key = `${slug} ${name}`.toLowerCase();
  return matchCategory(key) ?? Package;
}

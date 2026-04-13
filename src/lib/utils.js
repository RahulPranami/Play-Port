import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatIST(date, options = {}) {
  if (!date) return "";
  
  const defaultOptions = {
    timeZone: "Asia/Kolkata",
    ...options
  };

  return new Intl.DateTimeFormat("en-IN", defaultOptions).format(new Date(date));
}

export function formatISTDate(date) {
  return formatIST(date, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatISTTime(date) {
  return formatIST(date, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatISTFull(date) {
  return formatIST(date, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

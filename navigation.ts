import Link from 'next/link';
import { useRouter, usePathname, redirect } from 'next/navigation';

export const locales = ['en', 'ar'] as const;
export const localePrefix = 'always';

export { Link, useRouter, usePathname, redirect };

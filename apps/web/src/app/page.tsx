import { redirect } from 'next/navigation';

/**
 * Root page redirects to the assignments dashboard.
 */
export default function HomePage() {
  redirect('/assignments');
}

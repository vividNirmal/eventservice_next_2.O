// /src/app/dashboard/(dashboard)/(webContent)/web-content/page.jsx
import { redirect } from 'next/navigation';

export default function WebContentPage() {
    redirect('/dashboard/web-content/hero-section'); // Redirect to the "hero-section" page by default
}
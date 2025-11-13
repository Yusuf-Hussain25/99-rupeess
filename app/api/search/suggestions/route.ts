import { NextRequest, NextResponse } from 'next/server';
import type { SearchSuggestion } from '@/app/types';

// Mock data - replace with actual search index/API
const mockSuggestions: SearchSuggestion[] = [
  { type: 'shop', id: '1', title: 'Fashion Tailors', subtitle: 'Tailor Shop' },
  { type: 'category', id: '2', title: 'Tailors', subtitle: 'Category' },
  { type: 'location', id: '3', title: 'Patna, Bihar', subtitle: 'Location' },
  { type: 'shop', id: '4', title: 'Quick Tailor', subtitle: 'Tailor Shop' },
  { type: 'shop', id: '5', title: 'Dry Clean Express', subtitle: 'Dry Cleaning' },
  { type: 'category', id: '6', title: 'Dry Cleaning', subtitle: 'Category' },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q')?.toLowerCase() || '';
  const loc = searchParams.get('loc');

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  // Simple mock filtering - replace with actual search
  const suggestions = mockSuggestions
    .filter((s) => s.title.toLowerCase().includes(q))
    .slice(0, 6);

  return NextResponse.json({ suggestions });
}


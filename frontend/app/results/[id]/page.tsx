import React from 'react';
import ResultDetailClient from './ResultDetailClient';

export function generateStaticParams() {
  return [
    { id: 'sample' },
    { id: 'demo' },
    { id: 'default' },
    { id: 'cve-2024-4577' },
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ResultDetailClient id={id} />;
}

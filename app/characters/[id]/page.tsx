'use client';

import { useParams } from 'next/navigation';
import CharacterDetailsClient from './client';

export default function CharacterDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  
  return <CharacterDetailsClient id={id} />;
}

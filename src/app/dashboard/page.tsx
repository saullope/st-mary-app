import { Metadata } from "next";
import { ActivityDasboard } from "@/dashboard-components";
import getSession from '@/lib/auth/getSession'; 
import { DecodedIdToken } from 'firebase-admin/auth';
import { redirect } from 'next/navigation';

type GradeKey = 'firstGrade' | 'secondGrade' | 'thirdGrade';

export async function generateMetadata(): Promise<Metadata> {
  
  return {
    title: `LudiGame`,
    description: 'LudiGame for teachers'
  };
}


export default async function Dashboard() {
  const token: DecodedIdToken | null = await getSession();
  
  if (!token) {
        redirect('/auth/login');
      }

  return (
    <>
      <ActivityDasboard />
    </>
  );
}
import { Metadata } from "next";
import { GetServerSideProps } from 'next';
import { ActivityDasboard } from "@/dashboard-components";

export async function generateMetadata({ searchParams }: { searchParams: { grade?: string } }): Promise<Metadata> {
  const grade = searchParams.grade || 'default';
  return {
    title: `LudiGame - ${grade}`,
    description: 'LudiGame for teachers'
  };
}


export default async function Dashboard({ searchParams }: { searchParams: { grade?: string } }) {
  const grade = searchParams.grade || 'default';

  return (
    <>
      <ActivityDasboard grade={grade} />
    </>
  );
}
import {notFound} from 'next/navigation';
import {createPageMetadata,absoluteUrl} from '@/lib/seo';
import index from '@/public/data/water-watch/v1/matters/index.json';
import ResortMatter from './ResortMatter';
import NorthPlainsMatter from './NorthPlainsMatter';
export const dynamicParams=false;
export function generateStaticParams(){return index.matters.map(m=>({key:m.matter_id}));}
export async function generateMetadata({params}:{params:Promise<{key:string}>}) {
  const {key}=await params,m=index.matters.find(m=>m.matter_id===key);
  if(!m)notFound();
  const path=new URL(m.canonical_url).pathname;
  return {...createPageMetadata({title:m.title,description:'Source-linked chronology: recorded actions, conditions and what remains unknown in the supplied evidence.',path}),alternates:{canonical:absoluteUrl(path),types:{'application/json':m.json_url}}};
}
export default async function MatterPage({params}:{params:Promise<{key:string}>}) {
  const {key}=await params;
  if(key==='ntgcd-aqua-resort-eagle-mountain')return <ResortMatter/>;
  if(key==='north-plains-blf-enforcement')return <NorthPlainsMatter/>;
  notFound();
}

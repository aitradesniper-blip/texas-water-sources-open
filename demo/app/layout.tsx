import type { Metadata } from "next";
import "../../source/app/globals.css";
export const metadata: Metadata = {title:"Texas well-record research starter",description:"A local open-source well-record research starter. No account or API key required.",robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

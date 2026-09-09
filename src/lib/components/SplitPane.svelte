<script lang="ts">
    import { onMount } from "svelte";
    import type { Snippet } from "svelte";

    let {
        topContent,
        bottomContent,
    }: {
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

    function setTopPct(pct: number, offset: number = 0) {
        pct = Math.max(0, Math.min(100, pct));
        const topPx = offset + Math.round((pct / 100) * totalH());
        const botPx = totalH() - topPx;
        top.style.height = `${topPx}px`;
        bottom.style.height = `${botPx}px`;
    }

    onMount(() => {
        setTopPct(50);

        let dragging = false;
        let startY = 0;
        let startTopH = 0;

        function onMouseDown(e: MouseEvent) {
            dragging = true;
            startY = e.clientY;
            startTopH = top.getBoundingClientRect().height;
            e.preventDefault();
        }

        function onMouseMove(e: MouseEvent) {
            if (!dragging) return;
            const clamped = Math.max(
                MIN_PX,
                Math.min(totalH() - MIN_PX, startTopH + (e.clientY - startY)),
            );
            top.style.height = `${clamped}px`;
            bottom.style.height = `${totalH() - clamped}px`;
        }

        function onMouseUp() {
            dragging = false;
        }

        divider.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        return () => {
            divider.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
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
            <button onclick={() => setTopPct(0, 75)}>expand bottom</button>
            <button onclick={() => setTopPct(100, -50)}>collapse bottom</button>
        </div>
        <div id="bottom-pane" class="bottom-content">
            {@render bottomContent()}
        </div>
    </div>
</div>

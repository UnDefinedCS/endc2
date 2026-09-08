<script lang="ts">
    import favicon from "$lib/assets/favicon.svg";
    import { onMount } from "svelte";

    let { data, children } = $props();

    let lightMode = $state<boolean>(false);
    function changeMode() {
        lightMode = !lightMode;
        updateThemeData();
    }
    function updateThemeData() {
        const html = document.documentElement;
        const current = html.getAttribute('data-bs-theme');
        html.setAttribute('data-bs-theme', current === 'dark' ? 'light' : 'dark');
    }

    onMount(() => {
        updateThemeData();
    })
</script>

<svelte:head>
    <link rel="icon" href={favicon} />

    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Control Panel" />

    <link href="stylesheet.css" rel="stylesheet" />

    <title>Control Panel</title>
</svelte:head>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-2">
    <div class="container">

        <!-- Left side -->
        <div class="d-flex align-items-center">
            <a
                class="navbar-brand fw-semibold fs-5 me-4"
                href="/"
            >
                Main
            </a>

            <a
                class="nav-link text-light px-2"
                href="/admin"
            >
                Manage
            </a>
        </div>

        <!-- Mobile toggle -->
        <button
            class="navbar-toggler border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
        >
            <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Right side -->
        <div
            class="collapse navbar-collapse justify-content-end"
            id="mainNavbar"
        >
            <div class="d-flex align-items-center gap-3 mt-3 mt-lg-0">

                {#if data.user}
                    <span
                        class="badge rounded-pill bg-secondary fs-6 px-3 py-2"
                    >
                        {data.user.name}
                    </span>
                {/if}

                <input
                    type="checkbox"
                    class="btn-check"
                    id="colorMode"
                    autocomplete="off"
                    onclick={changeMode}
                >

                <label
                    class="btn btn-outline-secondary btn-sm theme-toggle"
                    for="colorMode"
                >
                    {lightMode ? "Light" : "Dark"}
                </label>

            </div>
        </div>

    </div>
</nav>

{#if data.error}
    <div class="container mt-3">
        <div class="alert alert-danger shadow-sm">
            {data.error}
        </div>
    </div>
{/if}

<main>
    {@render children()}
</main>
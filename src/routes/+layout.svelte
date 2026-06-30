<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { data, children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />

    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Control Panel" />

    <title>Control Panel</title>
</svelte:head>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3">
    <div class="container">

        <a class="navbar-brand fw-bold fs-4" href="/">
            Main
        </a>
		<a class="navbar-brand fs-5" href="/admin">
            Manage
        </a>

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

        <div class="collapse navbar-collapse" id="mainNavbar">
            <ul class="navbar-nav ms-auto align-items-center">

                <li class="nav-item">
					{#if data.user}
						<span class="badge rounded-pill bg-secondary fs-6 px-3 py-2">
							{data.user.name}
						</span>
					{/if}
                </li>

            </ul>
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

{@render children()}

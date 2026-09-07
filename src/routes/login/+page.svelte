<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { enhance } from "$app/forms";
    import { redirect } from "@sveltejs/kit";

    let username = $state<string>("");
    let password = $state<string>("");

    let loading = $state<boolean>(false);
    let showPassword = $state<boolean>(false);

    function clearResult() {
        error = warning = success = "";
    }

    let error = $state("");
    let warning = $state("");
    let success = $state("");
</script>

<div
    class="container d-flex justify-content-center align-items-center"
    style="min-height: 100vh;"
>
    <div class="card shadow-sm" style="width: 100%; max-width: 400px;">
        <div class="card-body p-4">
            <h3 class="card-title mb-4 text-center">Sign In</h3>

            <!-- Popup / alert area -->
            {#if error}
                <div class="alert alert-danger">{error}</div>
            {/if}
            {#if success}
                <div class="alert alert-success">{success}</div>
            {/if}
            {#if warning}
                <div class="alert alert-warning">{warning}</div>
            {/if}

            <!-- Form -->
            <form
                method="POST"
                action="?/login"
                use:enhance={() => {
                    return async ({ result, update }) => {
                        await update();
                        if (result.type === "success") {
                            if (result.data) {
                                if (result.data.success as boolean) {
                                    success = result.data.message as string;
                                    redirect(301, "/");
                                } else {
                                    error = result.data.message as string;
                                }
                            } else {
                                error = "Error Occurred";
                            }
                        } else {
                            error = "Error Occurred";
                        }

                        await invalidateAll();
                        setTimeout(clearResult, 5000);
                    };
                }}
            >
                <!-- Username -->
                <div class="mb-3">
                    <label for="username" class="form-label fw-semibold"
                        >Username</label
                    >
                    <input
                        id="username"
                        name="username"
                        type="text"
                        class="form-control form-control-lg rounded-3"
                        placeholder="username"
                        bind:value={username}
                        autocomplete="username"
                        required
                    />
                </div>

                <!-- Password -->
                <div class="mb-4">
                    <label for="password" class="form-label fw-semibold"
                        >Password</label
                    >

                    <div class="input-group input-group-lg">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            class="form-control rounded-start-3"
                            placeholder="••••••••"
                            bind:value={password}
                            autocomplete="current-password"
                            required
                        />

                        <button
                            type="button"
                            class="btn btn-outline-secondary rounded-end-3"
                            onclick={() => (showPassword = !showPassword)}
                            aria-label="Toggle password visibility"
                        >
                            {#if showPassword}
                                Hide
                            {:else}
                                Show
                            {/if}
                        </button>
                    </div>
                </div>

                <!-- Submit -->
                <button
                    type="submit"
                    class="btn btn-primary btn-lg w-100 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                >
                    {#if loading}
                        <span class="spinner-border spinner-border-sm"></span>
                        Signing in...
                    {:else}
                        <span>Sign In</span>
                        <span>→</span>
                    {/if}
                </button>
            </form>
        </div>
    </div>
</div>

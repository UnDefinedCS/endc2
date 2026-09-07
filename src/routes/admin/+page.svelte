<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { enhance } from "$app/forms";

    let deletingId = $state<number | null>(null);
    function clearResult() {
        error = warning = success = "";
    }

    let error = $state("");
    let warning = $state("");
    let success = $state("");

    const { data } = $props();
</script>

<svelte:head>
    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
    />
</svelte:head>

<div class="container py-5">
    <h2 class="mb-4">User Management</h2>

    {#if data.error}
        <div class="alert alert-danger">{data.error}</div>
    {/if}

    {#if error}
        <div class="alert alert-danger">{error}</div>
    {/if}
    {#if success}
        <div class="alert alert-success">{success}</div>
    {/if}
    {#if warning}
        <div class="alert alert-warning">{warning}</div>
    {/if}

    <!-- Create user form -->
    <div class="card mb-4">
        <div class="card-header">Add User</div>
        <div class="card-body">
            <form
                method="POST"
                action="?/create"
                use:enhance
                class="row g-2 align-items-end"
            >
                <div class="col-md-4">
                    <label for="username" class="form-label">Username</label>
                    <input
                        type="text"
                        class="form-control"
                        id="username"
                        name="username"
                        required
                    />
                </div>
                <div class="col-md-4">
                    <label for="password" class="form-label">Password</label>
                    <input
                        type="password"
                        class="form-control"
                        id="password"
                        name="password"
                        required
                    />
                </div>
                <div class="col-md-2">
                    <label for="role" class="form-label">Role</label>
                    <select class="form-select" id="role" name="role">
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <button type="submit" class="btn btn-primary w-100"
                        >Add</button
                    >
                </div>
            </form>
        </div>
    </div>

    <!-- User list -->
    <div class="card">
        <div class="card-header">All Users</div>
        <table class="table table-striped mb-0">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                {#if data.operators}
                    {#each data.operators as op}
                        <tr>
                            <td>{op.username}</td>
                            <td>
                                <span
                                    class="badge {op.role === 'admin'
                                        ? 'bg-danger'
                                        : 'bg-secondary'}"
                                >
                                    {op.role}
                                </span>
                            </td>
                            <td
                                >{new Date(
                                    op.createdAt,
                                ).toLocaleDateString()}</td
                            >
                            <td class="text-end">
                                <form
                                    method="POST"
                                    action="?/remove"
                                    use:enhance={() => {
                                        deletingId = op.id;
                                        return async ({ result, update }) => {
                                            await update();
                                            if (result.type === "success") {
                                                if (result.data) {
                                                    if (
                                                        result.data
                                                            .success as boolean
                                                    ) {
                                                        success = result.data
                                                            .message as string;
                                                    } else {
                                                        error = result.data
                                                            .message as string;
                                                    }
                                                } else {
                                                    error = "Error Occurred";
                                                }
                                            } else {
                                                error = "Error Occurred";
                                            }

                                            await invalidateAll();
                                            setTimeout(clearResult, 5000);

                                            deletingId = null;
                                        };
                                    }}
                                    onsubmit={(e) => {
                                        if (
                                            !confirm(
                                                `Delete user "${op.username}"?`,
                                            )
                                        )
                                            e.preventDefault();
                                    }}
                                    class="d-inline"
                                >
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={op.id}
                                    />
                                    <button
                                        type="submit"
                                        class="btn btn-sm btn-outline-danger"
                                        disabled={deletingId === op.id}
                                    >
                                        {deletingId === op.id
                                            ? "Removing..."
                                            : "Remove"}
                                    </button>
                                </form>
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
</div>

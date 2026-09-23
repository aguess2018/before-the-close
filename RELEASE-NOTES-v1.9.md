# Before the Close v1.9 — Security + Data Hardening

- Adds account-scoped local Journey caches so two accounts on one device cannot inherit or upload each other’s local data.
- Sign-out snapshots the current account locally, clears active Journey data, and keeps it locked until authentication.
- Account switching restores only the matching account cache and forces cloud-first reconciliation.
- Adds SQL hardening to reassert RLS owner isolation on every user-owned table.
- Hardens delete_own_account() with an empty search_path and authenticated-only execution.
- Preserves v1.8.1 legal navigation fix and all prior cloud/account fixes.

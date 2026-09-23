# Before the Close v1.6.4 — Favorites Delete Sync Fix

- Fixes cloud-restored favorites reappearing after removal.
- Favorites now synchronize as an exact collection: cloud rows absent locally are deleted before cloud pull.
- Removing the final favorite also clears the user’s cloud favorites.
- Preserves v1.6.3 cloud hydration and v1.6.2 sync stability fixes.
- No Supabase SQL migration required.

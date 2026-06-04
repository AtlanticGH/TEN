# Google Drive "extras" photos

**Source folder:** [extras on Google Drive](https://drive.google.com/drive/folders/1PryBaaXF9Wdmf_5oJUwlSRwC9XZmcz_D?usp=drive_link)

## Import steps

1. Open the link above (must be signed in if the folder is restricted).
2. Select all images → **Download** (or use Drive desktop sync).
3. Unzip/copy all `.jpg` files into this folder (`import/extras/`).
4. From project root:

```bash
npm run import:extras
```

Images are copied to `public/assets/images/extras/` and listed in `manifest.json`.

## Optional: Supabase media library

```bash
npm run import:extras -- --upload
```

Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

## Use in CMS

In **Admin → Pages → builder**, set image URLs like:

`/assets/images/extras/DSC09533.jpg`

Or pick from **Media library** after `--upload`.

# Google Sheets Guide (Skincare & Beauty)

Setup folder ini:

- Kategori frontend adalah hardcode (tetap dalam `script.js`).
- Data produk datang dari Google Sheets niche Skincare & Beauty.
- Produk dipadankan ke kategori melalui kolum `category`/`kategori`.

## Konfigurasi Semasa

Dalam `script.js`:

- `ACTIVE_NICHE`: `skincare_beauty`
- `spreadsheetId`: `1vTDmOFMrasqpd8H8uuiNfUNAqHyiOZ3kMadu3Fdg9tU`
- `productSheetGid`: `470679329`

## Struktur Sheet (Tab Niche)

Header disyorkan:

- `id`
- `name`
- `category`
- `benefit`
- `rating`
- `sold`
- `est_price`
- `link`
- `images`
- `recommended`
- `recommended_text` (optional)
- `enabled`
- `sort`

## Slug Kategori Hardcode (Mesti Match)

1. `jerawat-kulit-berminyak`
2. `brightening-glow`
3. `jeragat-dark-spot`
4. `anti-aging-kedutan`
5. `skin-barrier-sensitive`
6. `hydration-moisturizer`
7. `sunscreen-uv-protection`
8. `pori-blackhead-sebum`
9. `eye-care-dark-circle`
10. `body-care`
11. `hair-care`
12. `cleanser-makeup-remover`

## Multi Image

Kolum `images`:

- Pisah URL dengan `|`
- Contoh: `https://img1.jpg|https://img2.jpg|https://img3.jpg`
- Link Google Drive format `.../file/d/<FILE_ID>/view` disokong (auto convert)
- Pastikan imej Google Drive set `Anyone with the link (Viewer)`

## Enable / Disable

Kolum `enabled`:

- `1` / kosong = papar
- `0` / `false` / `off` / `no` / `disabled` = sorok

## Badge Recommended (Opsyenal)

Kolum `recommended`:

- `1` / `true` / `yes` / `on` / `recommended` = paparkan badge
- kosong / `0` = tak paparkan badge

Kolum `recommended_text` (optional):

- jika diisi, teks badge ikut nilai ini
- jika kosong, default teks badge = `Recommended`

## Susunan Produk

Kolum `sort` untuk urutan dalam kategori (kecil ke besar).

## Contoh Row

- `SCB-001 | Glow Serum A | brightening-glow | Bantu kulit nampak lebih seri... | 4.8 | 12.5k+ | RM 39 | https://affiliate-link | https://img1.jpg|https://img2.jpg | 1 | Top Pick | 1 | 1`

## Troubleshoot

Jika data tak keluar:

- semak `spreadsheetId` dan `productSheetGid` betul
- semak sheet public `Viewer`
- semak kolum `category` match slug di atas
- semak `enabled` bukan nilai disable

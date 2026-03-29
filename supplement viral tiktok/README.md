# Google Sheets Guide (Hardcoded Categories)

Setup terbaru:

- **Kategori di frontend adalah hardcode** (tetap).
- **Setiap niche guna 1 tab sheet** yang simpan semua produk niche itu.
- Produk masuk ke kategori berdasarkan kolum `category`/`kategori` pada row.
- `enabled` pada row produk untuk on/off display.

## 1) Konfigurasi Dalam script.js

Dalam `script.js`:

- `NICHE_SHEETS` = senarai niche dan tab data.
- `ACTIVE_NICHE` = niche yang sedang dipaparkan.

Contoh semasa:

- `supplement` -> spreadsheet `1vTDmOFMrasqpd8H8uuiNfUNAqHyiOZ3kMadu3Fdg9tU`
- tab data niche guna `productSheetGid: "0"`

Jika nak tambah niche baru, tambah objek baru dalam `NICHE_SHEETS`, kemudian tukar `ACTIVE_NICHE`.

## 2) Struktur Data Sheet (Satu Tab = Satu Niche)

Untuk setiap niche, guna 1 tab saja.
Contoh tab `supplement` ada semua produk supplement dalam satu tempat.

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
- `enabled`
- `sort`

## 3) Cara Isi Kolum category/kategori

Kolum `category` (atau `kategori`) mesti match kategori hardcode frontend.

Boleh isi sama ada:

- **slug** kategori (disyorkan), contoh: `jantung-kolesterol`
- atau nama kategori penuh, contoh: `Jantung & Kolesterol`

## 4) Senarai Kategori Hardcode (Tetap)

1. `jantung-kolesterol` (Jantung & Kolesterol)
2. `gula-darah-diabetes` (Gula Dalam Darah / Diabetes)
3. `minda-fokus` (Minda & Fokus)
4. `booster-tenaga-anti-letih` (Booster Tenaga & Anti-Letih)
5. `imun-ketahanan-badan` (Imun & Ketahanan Badan)
6. `buah-pinggang` (Buah Pinggang)
7. `sendi-tulang` (Sendi & Tulang)
8. `kurus-weight-loss` (Kurus / Weight Loss)
9. `sistem-penghadaman-usus` (Sistem Penghadaman / Usus)
10. `lelaki-stamina-dalaman` (Lelaki (Stamina & Dalaman))
11. `wanita-hormon-dalaman` (Wanita (Hormon & Dalaman))
12. `detox-pembersihan-badan` (Detox & Pembersihan Badan)

## 5) Multi Image

Guna kolum `images`:

- Pisah URL dengan `|`
- Contoh: `https://img1.jpg|https://img2.jpg|https://img3.jpg`
- Link Google Drive format `.../file/d/<FILE_ID>/view` juga disokong (script akan auto convert ke direct image URL).
- Pastikan fail gambar di Google Drive set ke `Anyone with the link (Viewer)`.

Frontend akan auto:

- swipe imej dalam card
- dots indicator
- klik imej terus ke link produk (sama seperti butang `View Product`)

## 6) Enable / Disable Produk

Kolum `enabled`:

- `1` / kosong = papar
- `0` / `false` / `off` / `no` / `disabled` = sorok

## 7) Susunan Produk

Kolum `sort` untuk susun produk dalam kategori (kecil -> besar).

## 8) Contoh Row

- `SUP-001 | Arcid Go | jantung-kolesterol | Sokongan harian... | 4.8 | 1.7k+ | RM 55 | https://affiliate-link | https://img1.jpg|https://img2.jpg | 1 | 1`

## 9) Troubleshoot

Jika data tak keluar:

- semak `ACTIVE_NICHE` betul
- semak `spreadsheetId` betul
- semak `productSheetGid` atau `productSheetName` betul
- semak sheet share ke `Anyone with the link (Viewer)`
- semak `category` match salah satu kategori hardcode
- semak `enabled` bukan nilai disable

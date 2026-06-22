# 🎵 MusicFinder

MusicFinder adalah aplikasi mobile yang memungkinkan pengguna untuk mencari, mengeksplorasi, dan menyimpan informasi musik favorit mereka. Aplikasi ini mengintegrasikan **iTunes Search API** melalui Axios untuk mengambil data lagu, album, dan artis secara real-time, serta memanfaatkan layanan **Firebase** untuk autentikasi pengguna dan penyimpanan data personal.

---

## ✨ Fitur Utama

- 🔍 Pencarian musik (lagu, album, artis) menggunakan iTunes Search API via Axios
- 🔐 Sistem autentikasi pengguna (Login & Register) menggunakan Firebase Authentication
- ❤️ Penyimpanan daftar favorit musik pribadi menggunakan Cloud Firestore

---

## 🌐 API yang Digunakan

| Nama API | Endpoint Utama | Keterangan |
|---|---|---|
| iTunes Search API | `https://itunes.apple.com/search` | Pencarian lagu, album, artis |
| Firebase Authentication | Firebase SDK | Login & Register pengguna |
| Cloud Firestore | Firebase SDK | Penyimpanan data favorit, playlist, dan nama username |

---

## 👥 Pembagian Tugas Tim

> Skenario B — 2 Orang

| Peran | Nama Anggota | Tugas | Tanggung Jawab Demo |
|---|---|---|---|
| 🎨 Frontend & Axios Specialist | Oktavia Amaliatusholikhah | Merancang seluruh UI/UX aplikasi dan bertanggung jawab penuh atas integrasi Axios untuk berkomunikasi dengan iTunes Search API | Menjelaskan desain UI dan mekanisme penarikan data dari API menggunakan Axios (Fitur 1 & Fitur 2) |
| 🔧 Backend, State & Firebase Specialist | Rafif Mahendra Rajesh Santosa | Mengelola logika state aplikasi dan bertanggung jawab penuh atas seluruh integrasi layanan Firebase | Menjelaskan manajemen data lokal aplikasi dan arsitektur Firebase yang digunakan (Fitur 3 + setup Firebase) |

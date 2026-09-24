# 🌐 Viral Sarees - Google Cloud Console & Custom Domain Setup Guide

Yeh file aapko **Google Cloud Console** aur **Firebase Console** me aapke custom domain (jaise `viralsarees.com` ya `viralsarees.in`) ko connect karne ka aasan tarika batati hai.

---

## 📁 Taiyar Ki Gayi Files (Project Files Created)

1. **`package.json`**:
   - Project Name set to: **`viral-sarees`**
   - Version: `1.0.0`
   - Build & Start scripts for Google Cloud Run production deployment.

2. **`Dockerfile`**:
   - Google Cloud Run production ready multi-stage Docker build.
   - Automatically builds frontend with Vite and runs the Express API server on dynamic `PORT` (8080/3000).

3. **`cloudbuild.yaml`**:
   - Google Cloud Build trigger file to deploy directly as service name **`viral-sarees`** in Google Cloud Console.

4. **`firebase.json` & `.firebaserc`**:
   - Configured for project **`vijay-laxmi-saree`**.
   - Enables 1-click custom domain connect with **Free Automatic SSL/HTTPS Certificate** via Firebase Hosting.

---

## 🚀 Domain Connect Karne Ke 2 Aasan Tarike

### Tarika 1: Firebase Console Se (Sabse Aasan & Free SSL)
Firebase Console Google Cloud ka hi hissa hai aur yahan domain connect karna sabse simple hota hai:

1. [Firebase Console](https://console.firebase.google.com/) me jayein.
2. Apna project select karein: **`vijay-laxmi-saree`**.
3. Left menu me **Hosting** par click karein.
4. **"Connect custom domain"** (Add Custom Domain) button par click karein.
5. Apna domain name enter karein (Jaise: `viralsarees.com` ya `shop.viralsarees.com`).
6. Firebase aapko **DNS Records** dikhayega:
   - **Type**: `A` Record ya `CNAME` Record
   - **Value**: Firebase ke IP addresses (jaise `199.36.158.100`, etc.)
7. Apne Domain Registrar (GoDaddy, Hostinger, Namecheap, ya Cloudflare) ke DNS Management me jakar yeh records add kar dein.
8. 15 se 30 minute me aapka custom domain live ho jayega with **Free Green Padlock SSL Certificate**!

---

### Tarika 2: Google Cloud Console (Cloud Run) Se
Agar aap sidha Google Cloud Console me Cloud Run service ke through domain link karna chahte hain:

1. [Google Cloud Console](https://console.cloud.google.com/) open karein.
2. Top bar se apna project select karein: **`vijay-laxmi-saree`** (Project Number: `948199954779`).
3. Search bar me **Cloud Run** search karein aur click karein.
4. Top menu me **"Manage Custom Domains"** (कस्टम डोमेन प्रबंधित करें) par click karein.
5. **"Add Mapping"** button par click karein:
   - **Select service to map to**: Select karein `viral-sarees` (ya current active Cloud Run service).
   - **Specify verified domain**: Apna domain daalein (e.g. `viralsarees.com` ya `www.viralsarees.com`).
6. Agar domain pehle verify nahi hai to Google Webmaster verification link dega jisme aapko TXT record add karna hoga.
7. Verification ke baad Google Cloud aapko **A Records / CNAME** provide karega.
8. Apne DNS provider me wo records save karein. Google Cloud automatically Google Managed SSL Certificate activate kar dega!

---

## 📋 DNS Records Quick Summary

| Record Type | Host / Name | Points To / Target Value | Purpose |
|-------------|-------------|--------------------------|---------|
| **A** | `@` (Root Domain) | Google / Firebase IP Address | Main website `viralsarees.com` open karega |
| **CNAME** | `www` | `ghs.googlehosted.com` ya Firebase host | `www.viralsarees.com` ko redirect karega |

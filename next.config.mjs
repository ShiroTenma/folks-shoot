/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Opsi ini sekarang ada di TOP LEVEL (bukan di dalam experimental) */
  reactCompiler: true,
  
  /* Izinkan domain ngrok mengakses server dev Anda */
  allowedDevOrigins: [
     "glairier-unexplanatory-brigette.ngrok-free.dev"
  ],

  /* Biarkan experimental kosong atau hapus jika tidak ada opsi lain */
  experimental: {
    // Kosongkan jika tidak ada konfigurasi experimental lain
  },
};

export default nextConfig;
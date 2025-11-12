import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="min-h-screen flex items-end justify-center p-4 overflow-auto">
      <div className="w-full max-w-lg my-45 bg-white shadow-xl rounded-2xl p-8 ">
        <h2 className="text-2xl font-bold text-center mb-6">Masuk ke Akun</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email/Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-500 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Masukkan Email atau Username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-500 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Masukkan Password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#044888] text-white py-2 rounded-xl hover:bg-[#0C8CE9] transition-all"
          >
            Masuk
          </button>
          

          <p className="text-sm text-left mt-2">Belum punya Akun? <a href="#" className="text-indigo-600 font-medium">Daftar</a>.</p>
          <p className="text-sm text-left mb-3">Ingin mengadakan Event? <a href="#" className="text-indigo-600 font-medium">Daftar Sebagai Penyelenggara Event</a></p>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { userAPI } from "../services/api";

export default function VerifikasiUserPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingOrganizers();
  }, []);

  const fetchPendingOrganizers = async () => {
    try {
      const response = await userAPI.getAllOrganizers(); 
      const pending = response.data.filter(
        (u) => u.register_status !== "approved"
      );
      setUsers(pending);
    } catch (error) {
      console.error(error);
      alert("Gagal memuat daftar organizer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8 rounded-2xl">
          
          <h2 className="text-2xl font-bold mb-6">Verifikasi Pengguna Organizer</h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
            </div>
          ) : users.length === 0 ? (
            <p className="text-gray-600">Tidak ada pengguna pending.</p>
          ) : (
            <div className="space-y-4">
              {users.map((u) => (
                <div
                  key={u.user_id}
                  className="p-4 bg-gray-50 rounded-lg shadow flex justify-between items-center"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{u.name || u.username}</h3>
                    <p className="text-gray-700 text-sm">{u.email}</p>

                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                        u.register_status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : u.register_status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {u.register_status}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/tinjauUser/${u.user_id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Tinjau
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

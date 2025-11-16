import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { userAPI } from "../services/api";

export default function TinjauUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchUserDetail();
  }, []);

  const fetchUserDetail = async () => {
    try {
      const response = await userAPI.getUserById(id);
      setUser(response.data);
    } catch (error) {
      console.error(error);
      alert("Gagal memuat detail pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (status) => {
    try {
      await userAPI.verifyOrganizer(id, {
        register_status: status,
        register_comment: comment || `User ${status}`,
      });

      alert(`Pengguna ${status === "approved" ? "disetujui" : "ditolak"}`);
      navigate("/verifikasiUser");
    } catch (error) {
      console.error(error);
      alert("Gagal memverifikasi pengguna");
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#E5E7EB]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex justify-center p-4">
        <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-10 mt-32">

          <h2 className="text-2xl font-bold mb-6">Tinjau Pengguna</h2>

          {user ? (
            <div className="space-y-6">
              {/* Foto & Nama */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                  {user.profile_pict ? (
                    <img
                      src={user.profile_pict}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-gray-500 text-2xl font-bold">
                        {user.name?.charAt(0).toUpperCase() ||
                          user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold">
                    {user.name || user.username}
                  </h3>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              {/* Informasi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-700">Username</label>
                  <p className="p-2 bg-gray-50 rounded">{user.username}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-700">Role</label>
                  <p className="p-2 bg-gray-50 rounded capitalize">{user.role}</p>
                </div>

                {/* Organizer Info */}
                <div>
                  <label className="text-sm text-gray-700">Organisasi</label>
                  <p className="p-2 bg-gray-50 rounded">
                    {user.organization || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-700">Tipe Organisasi</label>
                  <p className="p-2 bg-gray-50 rounded">
                    {user.organization_type || "-"}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-gray-700">Deskripsi</label>
                  <p className="p-2 bg-gray-50 rounded min-h-20">
                    {user.organization_description || "-"}
                  </p>
                </div>
              </div>

              {/* KTP */}
              <div>
                <h4 className="font-semibold mb-2">KTP</h4>
                {user.ktp ? (
                  <a
                    href={user.ktp}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    Lihat KTP
                  </a>
                ) : (
                  <p className="text-gray-500">Belum upload KTP</p>
                )}
              </div>

              {/* Kolom Komentar */}
              <div>
                <label className="text-sm font-medium">Komentar Verifikasi:</label>
                <textarea
                  className="w-full p-3 rounded border-gray-300 border mt-1"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Komentar untuk approval..."
                ></textarea>
              </div>

              {/* Tombol */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => handleVerify("rejected")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Tolak
                </button>
                <button
                  onClick={() => handleVerify("approved")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Approve
                </button>
              </div>
            </div>
          ) : (
            <p>Pengguna tidak ditemukan.</p>
          )}
        </div>
      </div>
    </div>
  );
}

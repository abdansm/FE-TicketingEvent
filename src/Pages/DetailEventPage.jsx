import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { MapPin, CalendarDays, Grid3X3, Edit, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Format Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Format tanggal dari backend
  const formatDate = (dateStart, dateEnd) => {
    const start = new Date(dateStart);
    const end = new Date(dateEnd);

    const formatOptions = { day: "numeric", month: "short", year: "numeric" };
    const startFormatted = start.toLocaleDateString("id-ID", formatOptions);
    const endFormatted = end.toLocaleDateString("id-ID", formatOptions);

    if (startFormatted === endFormatted) {
      return startFormatted;
    }
    return `${startFormatted} - ${endFormatted}`;
  };

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    location: "",
    city: "",
    date_start: "",
    date_end: "",
    category: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/event/${id}`);
        const eventData = response.data;

        setEvent(eventData);
        
        // Set form data untuk editing
        setEditForm({
          name: eventData.name,
          description: eventData.description,
          location: eventData.location,
          city: eventData.city,
          date_start: eventData.date_start ? new Date(eventData.date_start).toISOString().slice(0, 16) : "",
          date_end: eventData.date_end ? new Date(eventData.date_end).toISOString().slice(0, 16) : "",
          category: eventData.category
        });

        // Format ticket categories untuk state tickets
        const formattedTickets = eventData.ticket_categories.map((ticket) => ({
          ticket_category_id: ticket.ticket_category_id,
          type: ticket.name,
          desc: ticket.description || "Tiket masuk event",
          price: ticket.price,
          stock: ticket.quota - ticket.sold,
          quota: ticket.quota,
          sold: ticket.sold,
          qty: 0,
        }));

        setTickets(formattedTickets);

        // Check if current user is the owner
        checkOwnership(eventData);

      } catch (err) {
        console.error("Error fetching event detail:", err);
        setError("Gagal memuat detail event");
      } finally {
        setLoading(false);
      }
    };

    const checkOwnership = (eventData) => {
      try {
        const token = sessionStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setIsOwner(payload.user_id === eventData.owner_id);
        }
      } catch (err) {
        console.error('Error checking ownership:', err);
      }
    };

    if (id) {
      fetchEventDetail();
    }
  }, [id]);

  const updateQty = (index, delta) => {
    setTickets((prev) =>
      prev.map((t, i) => {
        if (i !== index) return t;
        const newQty = Math.min(Math.max(t.qty + delta, 0), t.stock);
        return { ...t, qty: newQty };
      })
    );
  };

  const handleAddToCart = async () => {
    try {
      // Siapkan data untuk dikirim ke cart sesuai struktur backend
      const cartItems = tickets
        .filter((ticket) => ticket.qty > 0)
        .map((ticket) => ({
          ticket_category_id: ticket.ticket_category_id,
          quantity: ticket.qty,
        }));

      if (cartItems.length === 0) {
        alert("Pilih setidaknya satu tiket");
        return;
      }

      // Kirim setiap item cart secara individual
      const promises = cartItems.map((item) => api.post("/api/cart", item));

      // Tunggu semua request selesai
      const results = await Promise.all(promises);

      // Cek jika semua berhasil
      const allSuccess = results.every((result) => result.status === 201);

      if (allSuccess) {
        alert("Tiket berhasil dimasukkan ke keranjang!");
        // Reset quantity setelah berhasil ditambahkan
        setTickets((prev) => prev.map((t) => ({ ...t, qty: 0 })));
      } else {
        throw new Error("Beberapa tiket gagal ditambahkan");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.data?.error) {
        alert(`Gagal menambahkan tiket: ${error.response.data.error}`);
      } else {
        alert("Gagal menambahkan tiket ke keranjang");
      }
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form jika cancel edit
      setEditForm({
        name: event.name,
        description: event.description,
        location: event.location,
        city: event.city,
        date_start: event.date_start ? new Date(event.date_start).toISOString().slice(0, 16) : "",
        date_end: event.date_end ? new Date(event.date_end).toISOString().slice(0, 16) : "",
        category: event.category
      });
    }
    setIsEditing(!isEditing);
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      
      // Prepare data for update
      const updateData = {
        ...editForm,
        date_start: new Date(editForm.date_start).toISOString(),
        date_end: new Date(editForm.date_end).toISOString()
      };

      const response = await api.put(`/api/events/${id}`, updateData);
      
      if (response.status === 200) {
        // Update local state
        setEvent(prev => ({
          ...prev,
          ...editForm,
          date_start: updateData.date_start,
          date_end: updateData.date_end
        }));
        
        setIsEditing(false);
        alert("Event berhasil diperbarui!");
        
        // Refresh data
        const refreshedResponse = await api.get(`/api/event/${id}`);
        setEvent(refreshedResponse.data);
      }
    } catch (error) {
      console.error("Error updating event:", error);
      if (error.response?.data?.error) {
        alert(`Gagal memperbarui event: ${error.response.data.error}`);
      } else {
        alert("Gagal memperbarui event");
      }
    } finally {
      setSaving(false);
    }
  };

  const canEdit = isOwner && (event?.status === 'pending' || event?.status === 'rejected');

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center pt-36">
          <div className="text-lg">Memuat detail event...</div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center pt-36">
          <div className="text-lg text-red-600">
            {error || "Event tidak ditemukan"}
          </div>
          <button
            onClick={() => navigate("/cariEvent")}
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Kembali ke Cari Event
          </button>
        </div>
      </div>
    );
  }

  const totalHarga = tickets.reduce((sum, t) => sum + t.price * t.qty, 0);
  const adaTiketDipilih = tickets.some((t) => t.qty > 0);

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 bg-white shadow-xl p-8">
          {/* Header dengan tombol edit untuk owner */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  className="text-3xl font-bold w-full p-2 border border-gray-300 rounded"
                  placeholder="Nama Event"
                />
              ) : (
                <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
              )}
            </div>
            
            {canEdit && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <Save size={18} />
                      {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button
                      onClick={handleEditToggle}
                      disabled={saving}
                      className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50"
                    >
                      <X size={18} />
                      Batal
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Edit size={18} />
                    Edit Event
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Status Info */}
          {isOwner && (
            <div className={`mb-6 p-3 rounded-lg ${
              event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              event.status === 'rejected' ? 'bg-red-100 text-red-800' :
              event.status === 'approved' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              <p className="font-semibold">
                Status: {event.status === 'pending' ? 'Pending' : 
                       event.status === 'rejected' ? 'Ditolak' : 
                       event.status === 'approved' ? 'Diterima' : 'Selesai'}
              </p>
              {event.approval_comment && (
                <p className="text-sm mt-1">Komentar: {event.approval_comment}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* === BAGIAN KIRI === */}
            <div className="lg:col-span-2">
              {/* Info Event */}
              <div className="space-y-2 text-gray-700 text-sm mb-8">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-[#0C8CE9] shrink-0 mt-0.5" />
                  {isEditing ? (
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => handleEditChange('location', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        placeholder="Lokasi"
                      />
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => handleEditChange('city', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        placeholder="Kota"
                      />
                    </div>
                  ) : (
                    <span>{event.location}, {event.city}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[#0C8CE9]" />
                  {isEditing ? (
                    <div className="flex-1 space-y-2">
                      <input
                        type="datetime-local"
                        value={editForm.date_start}
                        onChange={(e) => handleEditChange('date_start', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="datetime-local"
                        value={editForm.date_end}
                        onChange={(e) => handleEditChange('date_end', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  ) : (
                    <span>{formatDate(event.date_start, event.date_end)}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-[#0C8CE9]" />
                  {isEditing ? (
                    <select
                      value={editForm.category}
                      onChange={(e) => handleEditChange('category', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="">Pilih Kategori</option>
                      <option value="Music">Music</option>
                      <option value="Sports">Sports</option>
                      <option value="Arts">Arts</option>
                      <option value="Business">Business</option>
                      <option value="Technology">Technology</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <span>{event.category}</span>
                  )}
                </div>
              </div>

              {/* Tentang Event */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Tentang Event</h2>
                {isEditing ? (
                  <textarea
                    value={editForm.description}
                    onChange={(e) => handleEditChange('description', e.target.value)}
                    rows="6"
                    className="w-full p-3 border border-gray-300 rounded text-sm"
                    placeholder="Deskripsi event"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Pilihan Tiket - Hanya ditampilkan jika bukan owner atau sedang tidak edit */}
              {(!isOwner || !isEditing) && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Pilihan Tiket</h2>

                  {tickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Belum ada tiket tersedia untuk event ini
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tickets.map((ticket, index) => (
                        <div
                          key={ticket.ticket_category_id}
                          className="border rounded-md p-3 flex justify-between items-center hover:shadow-md transition-all"
                        >
                          <div className="flex-1">
                            <p className="font-semibold">{ticket.type}</p>
                            <p className="text-xs text-gray-600">{ticket.desc}</p>
                            <div className="flex gap-4 mt-1">
                              <p className="text-xs text-gray-500">
                                Stok: {ticket.stock} / {ticket.quota}
                              </p>
                              {ticket.stock === 0 && (
                                <span className="text-xs text-red-500 font-semibold">
                                  HABIS
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-red-900 font-semibold mt-1">
                              {formatRupiah(ticket.price)}
                            </p>
                          </div>

                          {!isOwner && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQty(index, -1)}
                                disabled={ticket.qty === 0}
                                className={`px-2 py-1 border rounded ${
                                  ticket.qty === 0
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-200"
                                }`}
                              >
                                −
                              </button>
                              <span className="w-5 text-center">{ticket.qty}</span>
                              <button
                                onClick={() => updateQty(index, 1)}
                                className={`px-2 py-1 border rounded ${
                                  ticket.qty >= ticket.stock || ticket.stock === 0
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-200"
                                }`}
                                disabled={
                                  ticket.qty >= ticket.stock || ticket.stock === 0
                                }
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* === BAGIAN KANAN === */}
            <div className="lg:col-span-1 space-y-5">
              {/* Gambar utama ratio 1:1 */}
              <div className="rounded-md overflow-hidden shadow-md aspect-square">
                <img
                  src={
                    event.image ||
                    "https://cdn2.steamgriddb.com/icon_thumb/63872edc3fa52d645b3d48f6d98caf2c.png"
                  }
                  alt={event.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://cdn2.steamgriddb.com/icon_thumb/63872edc3fa52d645b3d48f6d98caf2c.png";
                  }}
                />
              </div>

              {/* Flyer jika ada */}
              {event.flyer && (
                <div className="border rounded-md p-4 shadow-sm">
                  <h3 className="text-base font-semibold mb-2">Flyer Event</h3>
                  <img
                    src={event.flyer}
                    alt={`Flyer ${event.name}`}
                    className="w-full rounded-md"
                  />
                </div>
              )}

              {/* Penyelenggara */}
              <div className="border rounded-md p-4 shadow-sm flex flex-col">
                <p className="text-base font-semibold text-gray-700 mb-3">
                  Penyelenggara
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-16 aspect-square rounded-full overflow-hidden shrink-0 border bg-gray-200 flex items-center justify-center">
                    {event.owner?.profile_pict ? (
                      <img
                        src={event.owner.profile_pict}
                        alt={event.owner.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-semibold text-lg"
                      style={{
                        display: event.owner?.profile_pict ? "none" : "flex",
                      }}
                    >
                      {event.owner?.name?.charAt(0) || "O"}
                    </div>
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-800">
                      {event.owner?.name || "Organizer"}
                    </p>
                    {event.owner?.organization && (
                      <p className="text-sm text-gray-600">
                        {event.owner.organization}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Total Harga & Tombol - hanya untuk non-owner */}
              <AnimatePresence>
                {adaTiketDipilih && !isOwner && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-lg bg-[#F9FAFB] border shadow-md p-5 flex flex-col items-center"
                  >
                    <p className="text-xl font-bold text-gray-900 mb-3">
                      Total:{" "}
                      <span className="text-[#0C8CE9]">
                        {formatRupiah(totalHarga)}
                      </span>
                    </p>
                    <button
                      className="bg-[#0C8CE9] text-white font-medium px-6 py-2 rounded-lg hover:bg-[#0A6FC4] shadow transition-all"
                      onClick={handleAddToCart}
                    >
                      Masukkan ke Keranjang
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info untuk owner yang sedang edit */}
              {isEditing && isOwner && (
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Mode Edit:</strong> Anda dapat mengubah detail event karena status masih {event.status === 'pending' ? 'pending' : 'ditolak'}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
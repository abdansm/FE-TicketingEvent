import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
// import eventAPI from wherever your API is

export default function VerifikasiEventPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // const response = await eventAPI.getPendingEvents();
      // setEvents(response.data);
      setEvents([
        {
          id: 1,
          title: "Festival Musik Nusantara",
          organizerName: "IndoEvent Corp",
          description: "Festival musik terbesar dengan artis lokal dan internasional.",
        },
        {
          id: 2,
          title: "Tech Expo 2025",
          organizerName: "FutureTech ID",
          description: "Pameran teknologi inovatif dan showcase startup.",
        },
        {
          id: 3,
          title: "Charity Run 10K",
          organizerName: "RunForHelp Foundation",
          description: "Acara lari amal untuk penggalangan dana kesehatan.",
        },
      ]);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#E5E7EB] flex items-start justify-center p-4 overflow-auto">
        <div className="min-h-screen w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 bg-white shadow-xl p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6">Verifikasi Event</h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Memuat daftar event...</p>
            </div>
          ) : events.length === 0 ? (
            <p className="text-gray-600">Tidak ada event pending untuk diverifikasi.</p>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-gray-50 rounded-lg shadow flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <p className="text-gray-600 text-sm">{event.organizerName}</p>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Lihat Detail
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white max-w-lg w-full p-6 rounded-xl shadow-xl">
                <h3 className="text-xl font-bold mb-4">Detail Event</h3>
                <p className="text-gray-700 mb-2"><b>Nama Event:</b> {selectedEvent.title}</p>
                <p className="text-gray-700 mb-2"><b>Organizer:</b> {selectedEvent.organizerName}</p>
                <p className="text-gray-700 mb-4"><b>Deskripsi:</b> {selectedEvent.description}</p>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                  >
                    Tutup
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
                    Tolak
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
                    Setujui
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

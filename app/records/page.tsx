'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CampusShell } from "@/components/campus-shell";

export default function RecordsPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
    const [status, setStatus] = useState("All");

    const router = useRouter();

    useEffect(() => {
        fetch("http://localhost:8000/items/")
            .then((res) => res.json())
            .then((data) => {
                const formatted = data.map((item: any) => ({
                    id: item._id,
                    from: item.status === "lost" ? "Student" : "Lost & Found Office",
                    to: item.status === "lost" ? "Lost & Found Office" : "Student",
                    timestamp: item.created_at
                        ? new Intl.DateTimeFormat('en-MY', {
                              timeZone: 'Asia/Kuala_Lumpur',
                              dateStyle: 'medium',
                              timeStyle: 'short',
                          }).format(new Date(item.created_at))
                        : "N/A",
                    status: item.status === "lost" ? "Reported" : "Secured",
                }));

                const sorted = formatted.reverse();
                setRecords(sorted);
                setFilteredRecords(sorted);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching records:", err);
                setLoading(false);
            });
    }, []);

    // 🔍 FILTER LOGIC
    useEffect(() => {
        const filtered = records.filter((item: any) => {
            const matchesSearch =
                item.id.toLowerCase().includes(search.toLowerCase()) ||
                item.from.toLowerCase().includes(search.toLowerCase()) ||
                item.to.toLowerCase().includes(search.toLowerCase()) ||
                item.status.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                status === "All" || item.status === status;

            return matchesSearch && matchesStatus;
        });

        setFilteredRecords(filtered);
    }, [search, records, status]);

    // ⏳ Loading state
    if (loading) {
        return (
            <CampusShell title="Blockchain Records" showBack backHref="/">
                <div className="flex items-center justify-center py-20">
                    <p className="text-lg font-medium text-muted-foreground animate-pulse">Loading records…</p>
                </div>
            </CampusShell>
        );
    }

    return (
        <CampusShell title="Blockchain Records" showBack backHref="/">
            <div className="mx-auto w-full">


            {/* Search + Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by Record ID..."
                    className="border-4 border-black rounded-lg px-4 py-2 w-full md:w-1/3"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="border-4 border-black rounded-lg px-4 py-2 w-full md:w-1/4"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="All">All</option>
                    <option value="Secured">Secured</option>
                    <option value="Reported">Reported</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_black] overflow-hidden">

                {/* Header */}
                <div className="grid grid-cols-5 font-bold text-sm border-b-4 border-black bg-gray-50">
                    <div className="p-4">Record ID</div>
                    <div className="p-4">From</div>
                    <div className="p-4">To</div>
                    <div className="p-4">Report date</div>
                    <div className="p-4">Status</div>
                </div>

                {/* Rows */}
                {filteredRecords.length === 0 ? (
                    <p className="p-6 text-gray-500">No records found.</p>
                ) : (
                    filteredRecords.map((record) => (
                        <div
                            key={record.id}
                            className="grid grid-cols-5 border-b last:border-none hover:bg-gray-50 transition"
                        >
                            <div className="p-4 font-mono text-sm">{record.id}</div>
                            <div className="p-4">{record.from}</div>
                            <div className="p-4">{record.to}</div>
                            <div className="p-4 text-sm text-gray-500">
                                {record.timestamp}
                            </div>

                            {/* Status + View Button */}
                            <div className="p-4 flex items-center gap-3">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        record.status === "Secured"
                                            ? "bg-green-200 text-green-800"
                                            : "bg-amber-200 text-amber-800"
                                    }`}
                                >
                                    {record.status}
                                </span>

                                <button
                                    onClick={() => router.push(`/records/${record.id}`)}
                                    className="border-2 border-black px-3 py-1 rounded-md text-xs font-medium hover:bg-black hover:text-white transition"
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    ))
                )}
                </div>
            </div>
        </CampusShell>
    );
}
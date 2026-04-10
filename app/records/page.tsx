'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CampusShell } from "@/components/campus-shell";

// ─────────────────────────────────────────────
// StatusBadge — maps raw DB status → styled tag
// ─────────────────────────────────────────────
function StatusBadge({ initialEvent, status }: { initialEvent: string; status: string }) {
    const event = initialEvent?.toLowerCase();
    const st = status?.toLowerCase();

    if (st === "lost") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-rose-700/30 bg-rose-100 px-3 py-1 text-xs font-black text-rose-800 whitespace-nowrap">
                Lost - In search
            </span>
        );
    }
    if (st === "found") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-amber-700/30 bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 whitespace-nowrap">
                Found - Ready for claim
            </span>
        );
    }
    if (st === "claimed") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-green-700/30 bg-green-100 px-3 py-1 text-xs font-black text-green-800 whitespace-nowrap">
                Found - Claimed
            </span>
        );
    }
    // Fallback
    return (
        <span className="inline-flex items-center rounded-lg border-2 border-gray-300 bg-gray-100 px-3 py-1 text-xs font-black text-gray-600 whitespace-nowrap">
            {st || 'Unknown'}
        </span>
    );
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatMYT(isoString: string | undefined | null): string {
    if (!isoString) return "N/A";
    return new Intl.DateTimeFormat("en-MY", {
        timeZone: "Asia/Kuala_Lumpur",
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(isoString));
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function RecordsPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState("all");

    const router = useRouter();

    useEffect(() => {
        fetch("/api/items/all")
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok || !Array.isArray(data)) {
                    console.error("Error fetching records:", data?.error ?? res.statusText);
                    setRecords([]);
                    setFilteredRecords([]);
                    return;
                }
                const formatted = data.map((item: any) => ({
                    id: item._id,
                    name: item.name || "—",
                    timestamp: formatMYT(item.created_at),
                    initialEvent: item.initial_event,
                    status: item.status,
                })).reverse();

                setRecords(formatted);
                setFilteredRecords(formatted);
            })
            .catch((err) => {
                console.error("Error fetching records:", err);
            })
            .finally(() => setLoading(false));
    }, []);

    // Filter logic
    useEffect(() => {
        const q = search.toLowerCase();
        const filtered = records.filter((item) => {
            const matchesSearch =
                item.id.toLowerCase().includes(q) ||
                item.name.toLowerCase().includes(q);

            const matchesStatus =
                statusFilter === "all" ||
                statusFilter === "lost" && item.initialEvent === "lost" && item.status === "lost" ||
                statusFilter === "found" && item.initialEvent === "found" && item.status === "found" ||
                statusFilter === "claimed" && item.status === "claimed";

            return matchesSearch && matchesStatus;
        });

        setFilteredRecords(filtered);
    }, [search, records, statusFilter]);

    if (loading) {
        return (
            <CampusShell title="Lost and Found Records" showBack backHref="/">
                <div className="flex items-center justify-center py-20">
                    <p className="text-lg font-medium text-muted-foreground animate-pulse">Loading records…</p>
                </div>
            </CampusShell>
        );
    }

    return (
        <CampusShell title="Lost and Found Records" showBack backHref="/">
            <div className="mx-auto w-full">

                {/* Search + Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search by Record ID or item name…"
                        className="border-4 border-black rounded-lg px-4 py-2 w-full md:w-1/2"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        className="border-4 border-black rounded-lg px-4 py-2 w-full md:w-1/4"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="lost">Lost</option>
                        <option value="found">Found</option>
                        <option value="claimed">Claimed</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_black] overflow-hidden">

                    {/* Header — 4 cols now (no From / To) */}
                    <div className="grid grid-cols-[2fr_1.5fr_1.5fr_2.5fr] font-bold text-sm border-b-4 border-black bg-gray-50">
                        <div className="p-4">Record ID</div>
                        <div className="p-4">Item</div>
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
                                className="grid grid-cols-[2fr_1.5fr_1.5fr_2.5fr] border-b last:border-none hover:bg-gray-50 transition"
                            >
                                <div className="p-4 font-mono text-xs text-gray-500 truncate">{record.id}</div>
                                <div className="p-4 text-sm font-medium truncate">{record.name}</div>
                                <div className="p-4 text-sm text-gray-500">{record.timestamp}</div>

                                {/* Status badge + View — justify-between aligns buttons in one column */}
                                <div className="p-4 flex items-center justify-between gap-3 min-w-0">
                                    <div className="min-w-0">
                                        <StatusBadge initialEvent={record.initialEvent} status={record.status} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/records/${record.id}`)}
                                        className="shrink-0 mr-8 rounded-md border-2 border-black bg-white px-3 py-1 text-xs font-medium shadow-[4px_4px_0px_#000] transition hover:bg-black hover:text-white hover:shadow-[3px_3px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
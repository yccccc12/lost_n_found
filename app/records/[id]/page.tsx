'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function RecordDetailPage() {
    const { id } = useParams();
    const [record, setRecord] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:8000/items/")
            .then((res) => res.json())
            .then((data) => {
                const found = data.find((item: any) => item._id === id);

                if (found) {
                    const formatted = {
                        id: found._id,
                        from: found.status === "lost" ? "Student" : "Lost & Found Office",
                        to: found.status === "lost" ? "Lost & Found Office" : "Student",
                        timestamp: found.event_date || "N/A",
                        status: found.status === "lost" ? "Pending" : "Verified",
                    };

                    setRecord(formatted);
                }

                setLoading(false);
            });
    }, [id]);

    if (loading) return <p className="p-10">Loading record...</p>;

    if (!record) return <p className="p-10">Record not found</p>;

    return (
        <div className="px-6 md:px-12 py-10">
            <h1 className="text-4xl font-black mb-8">📄 Record Details</h1>

            <div className="border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_black] bg-white space-y-4">
                <p><strong>ID:</strong> {record.id}</p>
                <p><strong>From:</strong> {record.from}</p>
                <p><strong>To:</strong> {record.to}</p>
                <p><strong>Timestamp:</strong> {record.timestamp}</p>
                <p>
                    <strong>Status:</strong>{" "}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === "Verified"
                            ? "bg-green-200 text-green-800"
                            : "bg-yellow-200 text-yellow-800"
                    }`}>
                        {record.status}
                    </span>
                </p>
            </div>
        </div>
    );
}
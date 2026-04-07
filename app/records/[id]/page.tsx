'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusShell } from "@/components/campus-shell";
import { BlockchainReceipt } from "@/components/blockchain-receipt";

export default function RecordDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [record, setRecord] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        
        fetch(`http://localhost:8000/items/detail/${id}`)
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) {
                    setRecord(data);
                } else {
                    setRecord(null);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching record:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <CampusShell title="Record Details" showBack backHref="/records">
                <div className="flex items-center justify-center py-20">
                    <p className="text-lg font-medium text-muted-foreground animate-pulse">Loading record…</p>
                </div>
            </CampusShell>
        );
    }

    if (!record) {
        return (
            <CampusShell title="Record Details" showBack backHref="/records">
                <div className="py-10 text-center space-y-4">
                    <p className="text-lg font-medium text-destructive">Record not found</p>
                    <Button
                        variant="outline"
                        className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        onClick={() => router.push("/records")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Records
                    </Button>
                </div>
            </CampusShell>
        );
    }

    return (
        <CampusShell title="Record Details" showBack backHref="/records">
            <div className="max-w-2xl mx-auto">
                <BlockchainReceipt
                    txHash={record.tx_hash || null}
                    itemId={record._id}
                    itemName={record.name}
                    reportType={record.status}
                    eventDate={record.event_date || null}
                    reportedAt={record.created_at || null}
                    category={record.category || null}
                    description={record.description || null}
                    location={record.location || null}
                    imageUrls={record.image_urls?.length ? record.image_urls : null}
                >
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:w-fit"
                            onClick={() => router.push("/records")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Records
                        </Button>
                    </div>
                </BlockchainReceipt>
            </div>
        </CampusShell>
    );
}
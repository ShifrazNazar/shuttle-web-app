"use client";

import { useMemo, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { onValue, ref } from "firebase/database";

import { env } from "~/env";
import { rtdb } from "~/lib/firebaseClient";

type Shuttle = {
  id: string;
  lat: number;
  lng: number;
  heading?: number;
  speedKph?: number;
  updatedAt?: number;
};

export default function AdminDashboardPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });
  const [shuttles, setShuttles] = useState<Shuttle[]>([]);

  useMemo(() => {
    const unsub = onValue(ref(rtdb, "/shuttles"), (snap) => {
      const val = snap.val() as Record<string, any> | null;
      const list: Shuttle[] = val
        ? Object.entries(val).map(([id, v]) => ({
            id,
            lat: v.lat,
            lng: v.lng,
            heading: v.heading,
            speedKph: v.speedKph,
            updatedAt: v.updatedAt,
          }))
        : [];
      setShuttles(list);
    });
    return () => unsub();
  }, []);

  const center = useMemo(() => ({ lat: 37.7749, lng: -122.4194 }), []);

  if (!isLoaded) return <div>Loading map…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="mb-3 text-lg font-medium">Active Shuttles</h2>
          <div className="h-[60vh] w-full overflow-hidden rounded-md">
            <GoogleMap
              zoom={12}
              center={center}
              mapContainerClassName="h-full w-full"
            >
              {shuttles.map((s) => (
                <Marker key={s.id} position={{ lat: s.lat, lng: s.lng }} />
              ))}
            </GoogleMap>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-medium">Summary</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>Active shuttles: {shuttles.length}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

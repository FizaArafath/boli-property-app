"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchItemsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const statusClass = (s) => s.toLowerCase().replace(/\s+/g, "-"); // "In Stock" -> "in-stock"

export default function DashboardPage() {
  const { user, ready, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  // Route protection: unauthenticated -> /login
  useEffect(() => {
    if (ready && !isAuthenticated) router.replace("/login");
  }, [ready, isAuthenticated, router]);

  // Only fetch once we know the user is authenticated
  useEffect(() => {
    if (!ready || !isAuthenticated) return;
    let cancelled = false;
    fetchItemsApi()
      .then((data) => !cancelled && setItems(data))
      .catch(() => !cancelled && setError("Failed to load items."))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [ready, isAuthenticated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items;
  }, [items, query]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  // Don't flash protected content before the session check finishes
  if (!ready || !isAuthenticated) return <p className="state">Checking session...</p>;

  return (
    <div className="dashboard">
      <header className="topbar">
        <h1>Catalog</h1>
        <div className="topbar-right">
          <span>{user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <input
        className="search"
        type="search"
        placeholder="Search items by name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search items"
      />

      {loading && <p className="state">Loading items...</p>}
      {error && <p className="state error">{error}</p>}
      {!loading && !error && filtered.length === 0 && <p className="state">No items match "{query}".</p>}

      <div className="grid">
        {filtered.map((item) => (
          <article className="card" key={item.id}>
            {/* plain <img> avoids configuring next/image remote domains */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.name} loading="lazy" />
            <div className="card-body">
              <h3>{item.name}</h3>
              <p className="category">{item.category}</p>
              <div className="row">
                <strong>${item.price.toLocaleString()}</strong>
                <span className={`badge ${statusClass(item.status)}`}>{item.status}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

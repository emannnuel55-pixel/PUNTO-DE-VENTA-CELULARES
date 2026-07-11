"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface PhoneDevice {
  brand: string;
  model: string;
}

export function PhoneAutocomplete() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PhoneDevice[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [isManual, setIsManual] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/phones?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error(err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectDevice = (device: PhoneDevice) => {
    setBrand(device.brand);
    setModel(device.model);
    setQuery(`${device.brand} ${device.model}`);
    setShowDropdown(false);
    setIsManual(false);
  };

  return (
    <div className="phone-autocomplete-container" style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", gridColumn: "span 2" }}>
      {/* Inputs ocultos para enviar con el FormData al Action de Next.js */}
      <input type="hidden" name="brand" value={brand} />
      <input type="hidden" name="model" value={model} />

      {!isManual ? (
        <div className="field full" style={{ position: "relative" }} ref={dropdownRef}>
          <label>Buscar marca / modelo del celular</label>
          <div className="search-input-wrapper" style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", color: "#64748b" }} />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
                if (!e.target.value) {
                  setBrand("");
                  setModel("");
                }
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Escribe para buscar celular (ej. iPhone 15, Galaxy S24, Redmi...)"
              style={{ paddingLeft: "40px", width: "100%" }}
              required={!brand || !model}
            />
          </div>

          {showDropdown && results.length > 0 && (
            <div className="autocomplete-dropdown" style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "#1e293b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              marginTop: "4px",
              maxHeight: "200px",
              overflowY: "auto",
              zIndex: 50,
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
            }}>
              {results.map((device, index) => (
                <div
                  key={index}
                  onClick={() => selectDevice(device)}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    color: "#f8fafc"
                  }}
                  className="dropdown-item-hover"
                >
                  <strong style={{ color: "#3b82f6" }}>{device.brand}</strong> {device.model}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: "6px", textAlign: "right" }}>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => {
                setIsManual(true);
                setBrand("");
                setModel("");
                setQuery("");
              }}
              style={{ padding: "6px 10px", fontSize: "0.8rem" }}
            >
              ¿No aparece en la lista? Registro Manual
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "16px", width: "100%", alignItems: "end" }} className="manual-fields-grid">
          <div className="field" style={{ margin: 0 }}>
            <label>Marca (Manual)</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Ej. Apple, Samsung"
              required={isManual}
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Modelo (Manual)</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Ej. iPhone X, Galaxy Z"
              required={isManual}
            />
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: "42px", padding: "10px 14px" }}
            onClick={() => {
              setIsManual(false);
              setBrand("");
              setModel("");
              setQuery("");
            }}
          >
            Volver a buscar
          </button>
        </div>
      )}
    </div>
  );
}

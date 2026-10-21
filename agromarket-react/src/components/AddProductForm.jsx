import React, { useState } from "react";
import { apiFetch } from "../api";
export default function AddProductForm({ onAdded }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setError("");
    setBusy(true);
    const data = Object.fromEntries(new FormData(form));
    data.price = Number(data.price);
    try {
      const product = await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify(data),
      });
      onAdded(product);
      form.reset();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-panel">
      <h2>Добавить товар</h2>
      <form onSubmit={submit} className="auth-form">
        <label>
          Название
          <input name="name" required />
        </label>
        <label>
          Цена, тг
          <input name="price" type="number" min="0" step="1" required />
        </label>
        <label>
          Категория
          <input name="category" />
        </label>
        <label>
          Единица
          <input name="unit" defaultValue="кг" required />
        </label>
        <label>
          Изображение
          <input name="image" defaultValue="/images/apples.svg" />
        </label>
        <button disabled={busy}>{busy ? "Сохранение…" : "Добавить"}</button>
        {error && <p role="alert">{error}</p>}
      </form>
    </section>
  );
}

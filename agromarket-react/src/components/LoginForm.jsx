import React, { useState } from "react";
import { apiFetch } from "../api";
export default function LoginForm({ onLogin }) {
  const [mode, setMode] = useState("login"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const result = await apiFetch("/auth/" + mode, {
        method: "POST",
        body: JSON.stringify(data),
      });
      onLogin(result.user, result.token);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-panel">
      <h2>{mode === "login" ? "Вход" : "Регистрация"}</h2>
      <form onSubmit={submit} className="auth-form">
        {mode === "register" && (
          <label>
            Имя
            <input name="name" required />
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" required autoComplete="username" />
        </label>
        <label>
          Пароль
          <input
            name="password"
            type="password"
            required
            minLength={mode === "register" ? 8 : undefined}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
        </label>
        <button disabled={busy}>
          {busy
            ? "Подождите…"
            : mode === "login"
              ? "Войти"
              : "Зарегистрироваться"}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError("");
        }}
      >
        {mode === "login" ? "Создать аккаунт" : "Уже есть аккаунт"}
      </button>
    </section>
  );
}

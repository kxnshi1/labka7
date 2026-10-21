import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import ContactForm from "./components/ContactForm";

import { API_URL, apiFetch } from "./api";
import LoginForm from "./components/LoginForm";
import AddProductForm from "./components/AddProductForm";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    const expired = () => setUser(null);
    window.addEventListener("auth-expired", expired);
    if (localStorage.getItem("token"))
      apiFetch("/auth/me")
        .then((u) => {
          if (active) setUser(u);
        })
        .catch(() => {
          if (active) setUser(null);
        })
        .finally(() => {
          if (active) setChecking(false);
        });
    else setChecking(false);
    return () => {
      active = false;
      window.removeEventListener("auth-expired", expired);
    };
  }, []);
  function login(user, token) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  }
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const query = search.trim()
      ? `?search=${encodeURIComponent(search.trim())}`
      : "";

    fetch(`${API_URL}/products${query}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки товаров");
        return res.json();
      })
      .then(setProducts)
      .catch((error) => {
        if (error.name !== "AbortError") setProducts([]);
      });

    return () => controller.abort();
  }, [search, revision]);

  function handleAddToCart() {
    setCartCount((count) => count + 1);
  }

  return (
    <>
      <Header cartCount={cartCount} />
      <main className="page">
        <div style={{ gridColumn: "1 / -1" }}>
          {checking ? (
            <p>Проверка входа…</p>
          ) : user ? (
            <section className="auth-panel">
              <p>
                Вы вошли как {user.name} ({user.role})
              </p>
              <button onClick={logout}>Выйти</button>
            </section>
          ) : (
            <LoginForm onLogin={login} />
          )}
        </div>
        <section id="catalog" className="catalog">
          <div className="catalog-toolbar">
            <div>
              <p className="eyebrow">Свежие продукты с фермы</p>
              <h1>Каталог</h1>
            </div>
            <label className="search-box">
              <span className="sr-only">Поиск товаров</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Найти продукт..."
              />
            </label>
          </div>

          {user?.role === "admin" && (
            <AddProductForm
              onAdded={() => {
                setSearch("");
                setRevision((v) => v + 1);
              }}
            />
          )}
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={handleAddToCart}
                featured={product.id === 1}
              />
            ))}
          </div>

          {products.length === 0 && (
            <p className="empty-state">
              Ничего не найдено. Попробуйте другой запрос.
            </p>
          )}
        </section>

        <aside id="delivery" className="sidebar">
          <h2>Доставка</h2>
          <p>Привезём фермерские продукты прямо к двери.</p>
          <ul>
            <li>Астана — на следующий день</li>
            <li>Акмолинская область — 2–3 дня</li>
            <li>Бесплатно от 20 000 тг</li>
          </ul>
        </aside>

        <ContactForm />
      </main>
      <Footer />
    </>
  );
}

export default App;

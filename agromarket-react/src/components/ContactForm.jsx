import React from "react";
import { API_URL } from "../api";

function ContactForm() {
  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(`Ошибка: ${result.error}`);
        return;
      }

      alert(`Заявка №${result.id} принята!`);
      form.reset();
    } catch (error) {
      alert("Сервер недоступен. Запущен ли agromarket-server?");
    }
  }

  return (
    <section id="contact" className="contact">
      <div>
        <p className="eyebrow">Для магазинов и кафе</p>
        <h2>Оптовая заявка</h2>
        <p>Оставьте контакты и параметры заказа — менеджер свяжется с вами.</p>
      </div>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Имя / организация</label>
        <input id="name" name="name" type="text" required />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="farmer@mail.kz"
        />

        <label htmlFor="phone">Телефон</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+7 7XX XXX XX XX"
        />

        <label htmlFor="quantity">Объём заказа, кг</label>
        <input id="quantity" name="quantity" type="number" min="10" required />

        <label htmlFor="date">Желаемая дата доставки</label>
        <input id="date" name="date" type="date" required />

        <label htmlFor="comment">Комментарий</label>
        <textarea id="comment" name="comment" rows="4" />

        <button type="submit">Отправить заявку</button>
      </form>
    </section>
  );
}

export default ContactForm;

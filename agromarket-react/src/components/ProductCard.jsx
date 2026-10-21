import React from "react";
function ProductCard({ product, onAdd, featured }) {
  return (
    <article className={featured ? "card card--featured" : "card"}>
      {featured && <span className="badge">Товар недели</span>}
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">
        {product.price.toLocaleString("ru-RU")} тг / {product.unit}
      </p>
      <button type="button" onClick={onAdd}>
        В корзину
      </button>
    </article>
  );
}
export default ProductCard;

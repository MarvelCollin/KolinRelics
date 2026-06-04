import { useState } from "react";
import type { Relic } from "../types";

interface Props {
  relic: Relic;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function RelicCard({ relic }: Props) {
  const [active, setActive] = useState(0);
  const hasImages = relic.images.length > 0;

  return (
    <article className="card">
      <div className="card-media">
        {hasImages ? (
          <img src={relic.images[active]} alt={relic.name} />
        ) : (
          <div className="card-noimage">No image</div>
        )}
        {relic.images.length > 1 && (
          <div className="card-thumbs">
            {relic.images.map((url, index) => (
              <button
                key={url}
                type="button"
                className={index === active ? "thumb thumb-active" : "thumb"}
                onClick={() => setActive(index)}
              >
                <img src={url} alt={`${relic.name} ${index + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="card-body">
        <h2>{relic.name}</h2>
        <p className="card-desc">{relic.description}</p>
        <div className="card-prices">
          <span className="price-buy">Buy {formatPrice(relic.price_buy)}</span>
          <span className="price-current">Sell {formatPrice(relic.price_current)}</span>
        </div>
      </div>
    </article>
  );
}

export default RelicCard;

import { useEffect, useMemo, useState, type ReactNode } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  count: number;
  color: string;
};

type Tab = "counter" | "summary" | "settings";

const STORAGE_KEY = "cuenta-facil-products";
const COLORS = ["#F5A623", "#14B8A6", "#8B5CF6", "#F43F5E", "#3B82F6", "#84CC16"];

const initialProducts: Product[] = [
  { id: "1", name: "PROMO1", price: 12000, count: 0, color: COLORS[0] },
  { id: "2", name: "PROMO2", price: 18000, count: 0, color: COLORS[1] },
];

function Icon({
  children,
  className = "h-5 w-5",
  viewBox = "0 0 24 24",
}: {
  children: ReactNode;
  className?: string;
  viewBox?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox={viewBox}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });
  const [activeTab, setActiveTab] = useState<Tab>("counter");
  const [editing, setEditing] = useState<Product | null | "new">(null);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const totalItems = products.reduce((sum, product) => sum + product.count, 0);
  const totalRevenue = products.reduce((sum, product) => sum + product.count * product.price, 0);
  const leader = useMemo(
    () =>
      products.reduce<Product | null>(
        (best, item) => (!best || item.count > best.count ? item : best),
        null,
      ),
    [products],
  );

  const updateCount = (id: string, delta: number) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, count: Math.max(0, product.count + delta) } : product,
      ),
    );
  };

  const saveProduct = (product: Product) => {
    setProducts((current) => {
      const exists = current.some((item) => item.id === product.id);
      return exists
        ? current.map((item) => (item.id === product.id ? product : item))
        : [...current, product];
    });
    setEditing(null);
  };

  const resetDay = () => {
    setProducts((current) => current.map((product) => ({ ...product, count: 0 })));
    setShowReset(false);
  };

  return (
    <main className="min-h-dvh bg-[#eef1ed] text-[#18221f] sm:grid sm:place-items-center sm:p-6">
      <section className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fafbf8] shadow-2xl sm:min-h-[880px] sm:rounded-[36px] sm:border sm:border-white">
        <header className="flex items-center justify-between px-6 pb-5 pt-7">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#77817d]">
              Ruta 52
            </p>
            <h1 className="text-[28px] font-black tracking-[-0.04em]">
              {activeTab === "counter"
                ? "Contador Birras"
                : activeTab === "summary"
                  ? "Resumen del día"
                  : "Ajustes"}
            </h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-28">
          {activeTab === "counter" && (
            <CounterView
              products={products}
              totalItems={totalItems}
              totalRevenue={totalRevenue}
              onCount={updateCount}
              onAdd={() => setEditing("new")}
              onReset={() => setShowReset(true)}
            />
          )}
          {activeTab === "summary" && (
            <SummaryView
              products={products}
              totalItems={totalItems}
              totalRevenue={totalRevenue}
              leader={leader}
            />
          )}
          {activeTab === "settings" && (
            <SettingsView
              products={products}
              onEdit={setEditing}
              onAdd={() => setEditing("new")}
              onDelete={(id) => setProducts((current) => current.filter((item) => item.id !== id))}
            />
          )}
        </div>

        <nav className="absolute inset-x-4 bottom-4 z-10 grid grid-cols-3 rounded-[24px] border border-[#e6e9e4] bg-white/95 p-2 shadow-[0_12px_35px_rgba(28,40,35,0.14)] backdrop-blur">
          <NavButton
            active={activeTab === "counter"}
            label="Contar"
            onClick={() => setActiveTab("counter")}
          >
            <Icon>
              <rect x="4" y="4" width="16" height="16" rx="4" />
              <path d="M8 12h8M12 8v8" />
            </Icon>
          </NavButton>
          <NavButton
            active={activeTab === "summary"}
            label="Resumen"
            onClick={() => setActiveTab("summary")}
          >
            <Icon>
              <path d="M5 20V10M12 20V4M19 20v-7" />
            </Icon>
          </NavButton>
          <NavButton
            active={activeTab === "settings"}
            label="Ajustes"
            onClick={() => setActiveTab("settings")}
          >
            <Icon>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
            </Icon>
          </NavButton>
        </nav>

        {editing && (
          <ProductModal
            product={editing === "new" ? null : editing}
            onClose={() => setEditing(null)}
            onSave={saveProduct}
          />
        )}
        {showReset && (
          <ConfirmModal
            onCancel={() => setShowReset(false)}
            onConfirm={resetDay}
            title="¿Empezar un nuevo conteo?"
            text="Todas las cantidades volverán a cero. Tus tarjetas y precios no cambiarán."
          />
        )}
      </section>
    </main>
  );
}

function CounterView({
  products,
  totalItems,
  totalRevenue,
  onCount,
  onAdd,
  onReset,
}: {
  products: Product[];
  totalItems: number;
  totalRevenue: number;
  onCount: (id: string, delta: number) => void;
  onAdd: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <div className="mb-5 flex items-center justify-between rounded-[22px] bg-[#1c2925] p-5 text-white shadow-[0_12px_28px_rgba(28,41,37,0.16)]">
        <div>
          <p className="mb-1 text-xs font-semibold text-white/55">GANANCIA ACTUAL</p>
          <p className="text-[30px] font-black tracking-[-0.03em]">{formatMoney(totalRevenue)}</p>
        </div>
        <div className="border-l border-white/15 pl-5 text-right">
          <p className="text-2xl font-bold">{totalItems}</p>
          <p className="text-xs text-white/55">vendidas</p>
        </div>
      </div>

      <button
        onClick={onReset}
        disabled={totalItems === 0}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e3e7e2] bg-white px-4 py-3.5 text-sm font-extrabold text-[#53605b] shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Icon className="h-4 w-4">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </Icon>
        Reiniciar contadores
      </button>

      {products.length ? (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="relative flex min-h-[220px] flex-col overflow-hidden rounded-[26px] p-4 text-white shadow-sm"
              style={{ backgroundColor: product.color }}
            >
              <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10" />
              <div className="relative mb-auto">
                <p className="max-w-[120px] text-base font-extrabold leading-tight">
                  {product.name}
                </p>
                <p className="mt-1 text-xs font-semibold text-white/70">
                  {formatMoney(product.price)} c/u
                </p>
              </div>
              <button
                onClick={() => onCount(product.id, 1)}
                className="relative my-3 flex flex-1 items-center justify-center rounded-[22px] bg-white/18 text-[58px] font-black tracking-[-0.06em] shadow-inner transition active:scale-[0.97] active:bg-white/25"
                aria-label={`Sumar una ${product.name}`}
              >
                {product.count}
              </button>
              <div className="relative flex items-center justify-between">
                <button
                  onClick={() => onCount(product.id, -1)}
                  disabled={product.count === 0}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-black/10 text-2xl font-light transition active:scale-90 disabled:opacity-30"
                  aria-label={`Restar una ${product.name}`}
                >
                  −
                </button>
                <span className="text-sm font-bold">
                  {formatMoney(product.count * product.price)}
                </span>
                <button
                  onClick={() => onCount(product.id, 1)}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-white text-2xl font-medium text-[#1c2925] shadow-sm transition active:scale-90"
                  aria-label={`Sumar una ${product.name}`}
                >
                  +
                </button>
              </div>
            </article>
          ))}
          <button
            onClick={onAdd}
            className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-[26px] border-2 border-dashed border-[#d9ded8] text-[#69736f] transition hover:border-[#1c2925] hover:text-[#1c2925] active:scale-[0.98]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e9ede8] text-2xl">
              +
            </span>
            <span className="text-sm font-bold">Nueva tarjeta</span>
          </button>
        </div>
      ) : (
        <EmptyState onAdd={onAdd} />
      )}
    </>
  );
}

function SummaryView({
  products,
  totalItems,
  totalRevenue,
  leader,
}: {
  products: Product[];
  totalItems: number;
  totalRevenue: number;
  leader: Product | null;
}) {
  const maxCount = Math.max(...products.map((item) => item.count), 1);

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[28px] bg-[#1c2925] p-6 text-white">
        <p className="text-sm font-semibold text-white/55">Total ganado</p>
        <p className="mt-1 text-[42px] font-black tracking-[-0.05em]">
          {formatMoney(totalRevenue)}
        </p>
        <div className="mt-6 flex gap-3 border-t border-white/10 pt-5">
          <div className="flex-1">
            <p className="text-2xl font-bold">{totalItems}</p>
            <p className="text-xs text-white/50">Unidades vendidas</p>
          </div>
          <div className="flex-1">
            <p className="truncate text-lg font-bold">
              {leader && leader.count > 0 ? leader.name : "—"}
            </p>
            <p className="text-xs text-white/50">Más vendida</p>
          </div>
        </div>
      </section>

      <section className="rounded-[26px] border border-[#e7eae5] bg-white p-5">
        <h2 className="mb-5 text-lg font-extrabold">Ventas por tarjeta</h2>
        {products.length === 0 && (
          <p className="py-5 text-center text-sm text-[#7d8682]">Aún no tienes tarjetas.</p>
        )}
        <div className="space-y-5">
          {products.map((product) => (
            <div key={product.id}>
              <div className="mb-2 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{product.name}</p>
                  <p className="text-xs text-[#858e8a]">{product.count} vendidas</p>
                </div>
                <p className="shrink-0 text-sm font-extrabold">
                  {formatMoney(product.count * product.price)}
                </p>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#edf0ec]">
                <div
                  className="h-full min-w-0 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: product.color,
                    width: `${(product.count / maxCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {leader && leader.count > 0 && (
        <section className="flex items-center gap-4 rounded-[24px] border border-[#f1e5bd] bg-[#fff8df] p-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f5a623] text-white">
            <Icon className="h-6 w-6">
              <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" />
              <path d="M7 6H4v1a4 4 0 0 0 4 4M17 6h3v1a4 4 0 0 1-4 4" />
            </Icon>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#9a7020]">
              La favorita de hoy
            </p>
            <p className="mt-0.5 font-extrabold">{leader.name}</p>
            <p className="text-sm text-[#776a4a]">
              Lleva {leader.count} {leader.count === 1 ? "venta" : "ventas"}.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function SettingsView({
  products,
  onEdit,
  onAdd,
  onDelete,
}: {
  products: Product[];
  onEdit: (product: Product) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      <p className="mb-5 text-sm leading-relaxed text-[#707a76]">
        Personaliza las tarjetas que quieres contar y asigna el precio de cada una.
      </p>
      <div className="space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 rounded-[22px] border border-[#e7eae5] bg-white p-3"
          >
            <div
              className="h-12 w-12 shrink-0 rounded-2xl"
              style={{ backgroundColor: product.color }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold">{product.name}</p>
              <p className="text-sm text-[#78817d]">{formatMoney(product.price)}</p>
            </div>
            <button
              onClick={() => onEdit(product)}
              className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0f2ef] text-[#56615d]"
              aria-label={`Editar ${product.name}`}
            >
              <Icon className="h-4 w-4">
                <path d="m4 20 4.2-1 10.4-10.4a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" />
                <path d="m14 7 3 3" />
              </Icon>
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="grid h-10 w-10 place-items-center rounded-xl text-[#a65c5c] hover:bg-[#fff0f0]"
              aria-label={`Eliminar ${product.name}`}
            >
              <Icon className="h-4 w-4">
                <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
              </Icon>
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onAdd}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1c2925] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#1c2925]/10 transition active:scale-[0.98]"
      >
        <span className="text-xl leading-none">+</span> Agregar nueva tarjeta
      </button>
      <div className="mt-8 rounded-2xl bg-[#eff2ee] p-4 text-xs leading-relaxed text-[#727c78]">
        Tus datos se guardan automáticamente en este dispositivo.
      </div>
    </>
  );
}

function NavButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-[17px] py-2.5 text-[11px] font-bold transition ${active ? "bg-[#e7eee9] text-[#1c2925]" : "text-[#929a96]"
        }`}
    >
      {children}
      {label}
    </button>
  );
}

function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price.toString() ?? "");
  const [color, setColor] = useState(product?.color ?? COLORS[0]);
  const valid = name.trim().length > 0 && Number(price) > 0;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    onSave({
      id: product?.id ?? crypto.randomUUID(),
      name: name.trim(),
      price: Number(price),
      count: product?.count ?? 0,
      color,
    });
  };

  return (
    <div
      className="absolute inset-0 z-30 flex items-end bg-[#101713]/45 p-3 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <form
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full rounded-[30px] bg-[#fafbf8] p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#7e8783]">
              {product ? "Editar" : "Nueva"}
            </p>
            <h2 className="text-2xl font-black tracking-tight">Configurar tarjeta</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-[#e9ece8] text-xl"
          >
            ×
          </button>
        </div>
        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-bold">Nombre</span>
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Entrada general"
            className="w-full rounded-2xl border border-[#dfe4de] bg-white px-4 py-3.5 outline-none transition focus:border-[#1c2925] focus:ring-2 focus:ring-[#1c2925]/10"
          />
        </label>
        <label className="mb-5 block">
          <span className="mb-2 block text-sm font-bold">Precio por unidad</span>
          <div className="flex items-center rounded-2xl border border-[#dfe4de] bg-white px-4 focus-within:border-[#1c2925] focus-within:ring-2 focus-within:ring-[#1c2925]/10">
            <span className="font-bold text-[#7d8682]">$</span>
            <input
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0,00"
              className="w-full bg-transparent px-3 py-3.5 outline-none"
            />
          </div>
        </label>
        <fieldset className="mb-7">
          <legend className="mb-3 text-sm font-bold">Color</legend>
          <div className="flex justify-between">
            {COLORS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setColor(option)}
                className={`grid h-11 w-11 place-items-center rounded-full transition ${color === option ? "ring-2 ring-[#1c2925] ring-offset-2" : ""}`}
                style={{ backgroundColor: option }}
                aria-label={`Elegir color ${option}`}
              >
                {color === option && <span className="text-xl font-bold text-white">✓</span>}
              </button>
            ))}
          </div>
        </fieldset>
        <button
          disabled={!valid}
          className="w-full rounded-2xl bg-[#1c2925] py-4 font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35"
        >
          Guardar tarjeta
        </button>
      </form>
    </div>
  );
}

function ConfirmModal({
  title,
  text,
  onCancel,
  onConfirm,
}: {
  title: string;
  text: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-[#101713]/45 p-6 backdrop-blur-[2px]">
      <div className="w-full rounded-[28px] bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-black">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6f7975]">{text}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onCancel} className="rounded-2xl bg-[#eff2ee] py-3.5 text-sm font-bold">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-2xl bg-[#1c2925] py-3.5 text-sm font-bold text-white"
          >
            Sí, reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-[28px] border-2 border-dashed border-[#dfe3de] px-6 py-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#e9ede8] text-3xl">
        +
      </div>
      <h2 className="font-extrabold">Crea tu primera tarjeta</h2>
      <p className="mt-2 text-sm text-[#7c8581]">
        Añade un producto o servicio para empezar a contar.
      </p>
      <button
        onClick={onAdd}
        className="mt-5 rounded-xl bg-[#1c2925] px-5 py-3 text-sm font-bold text-white"
      >
        Agregar tarjeta
      </button>
    </div>
  );
}

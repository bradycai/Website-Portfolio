// Interactive case-study demos. Each one binds once to its markup if it's on the page.

const fmtPct = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n)}%`;

/** Fill a range track up to its thumb. */
function paintRange(input: HTMLInputElement) {
  const min = Number(input.min);
  const max = Number(input.max);
  input.style.setProperty("--pct", `${((Number(input.value) - min) / (max - min)) * 100}%`);
}

/* ---------- Risk engine playground (trading assistant) ---------- */

const PORTFOLIO = 10_000;
const MAX_POSITION_PCT = 10;
const MAX_OPEN_POSITIONS = 3;
const DAILY_LOSS_LIMIT = -10;
const PENNY_PRICE = 5;
const MAX_INTRADAY_GAIN = 50;

function setupRiskPlayground() {
  const root = document.querySelector<HTMLElement>("[data-risk]");
  if (!root || root.dataset.bound) return;
  root.dataset.bound = "1";

  const form = root.querySelector<HTMLFormElement>("[data-risk-form]")!;
  const ranges = [...form.querySelectorAll<HTMLInputElement>("input[type=range]")];
  const out = (name: string) => form.querySelector<HTMLOutputElement>(`[data-out="${name}"]`)!;
  const rows = [...root.querySelectorAll<HTMLElement>("[data-rule]")];
  const verdict = root.querySelector<HTMLElement>("[data-risk-verdict]")!;

  const update = () => {
    const data = new FormData(form);
    const v = {
      market: data.get("type") === "market",
      stop: data.get("stop") === "on",
      option: data.get("option") === "on",
      size: Number(data.get("size")),
      cash: Number(data.get("cash")),
      price: Number(data.get("price")),
      move: Number(data.get("move")),
      pnl: Number(data.get("pnl")),
      open: Number(data.get("open")),
    };

    out("size").textContent = `${v.size}% ($${((v.size / 100) * PORTFOLIO).toLocaleString()})`;
    out("cash").textContent = `${v.cash}%`;
    out("price").textContent = `$${v.price}`;
    out("move").textContent = fmtPct(v.move);
    out("pnl").textContent = fmtPct(v.pnl);
    out("open").textContent = `${v.open} of ${MAX_OPEN_POSITIONS}`;
    ranges.forEach(paintRange);

    const rules: [boolean, string][] = [
      [v.pnl > DAILY_LOSS_LIMIT, v.pnl > DAILY_LOSS_LIMIT ? "Trading is open today" : "Down 10% today: everything halts"],
      [v.stop, v.stop ? "Protective stop goes with the order" : "Every order needs a stop loss"],
      [!v.market, v.market ? "Market orders aren't allowed" : "Price is capped by the limit"],
      [v.size <= MAX_POSITION_PCT, v.size <= MAX_POSITION_PCT ? `${v.size}% is within the cap` : `${v.size}% is over the 10% cap`],
      [v.open < MAX_OPEN_POSITIONS, v.open < MAX_OPEN_POSITIONS ? "Room for a new position" : "Already at the 3-position limit"],
      [v.size <= v.cash, v.size <= v.cash ? "Paid for in cash" : "The order would need margin"],
      [!v.option, v.option ? "Options aren't allowed" : "Plain shares only"],
      [!(v.market && v.price < PENNY_PRICE), v.price < PENNY_PRICE ? "Penny stock: limit orders only" : "Not a penny stock"],
      [v.move <= MAX_INTRADAY_GAIN, v.move <= MAX_INTRADAY_GAIN ? "Normal move" : "Parabolic: up more than 50%"],
    ];

    rows.forEach((row, i) => {
      const [pass, detail] = rules[i];
      row.classList.toggle("fail", !pass);
      row.querySelector("[data-rule-detail]")!.textContent = detail;
    });

    const failed = rules.filter(([pass]) => !pass).length;
    // Claude never sets the size: the server turns the allowed dollar amount into shares.
    const shares = Math.floor(((v.size / 100) * PORTFOLIO) / v.price);
    verdict.classList.toggle("rejected", failed > 0);
    verdict.innerHTML =
      failed === 0
        ? `<strong>Approved.</strong> The server sizes it at ${shares} share${shares === 1 ? "" : "s"} and sends a bracket order to Alpaca, with the stop loss attached at the broker.`
        : `<strong>Rejected by risk.</strong> ${failed} rule${failed === 1 ? "" : "s"} failed, so the intent is logged and can’t be approved.`;
  };

  form.addEventListener("input", update);
  form.addEventListener("submit", (event) => event.preventDefault());
  update();
}

/* ---------- Stock math demo (OrderSync) ---------- */

const LOW_STOCK = 3; // OrderSync flags products with fewer than 3 available.

function setupStockDemo() {
  const root = document.querySelector<HTMLElement>("[data-stock]");
  if (!root || root.dataset.bound) return;
  root.dataset.bound = "1";

  const steppers = [...root.querySelectorAll<HTMLElement>("[data-stepper]")];
  const math = root.querySelector<HTMLElement>("[data-stock-math]")!;
  const alert = root.querySelector<HTMLElement>("[data-stock-alert]")!;
  const log = root.querySelector<HTMLElement>("[data-stock-log]")!;
  let nextOrder = 1043;
  const entries: string[] = [];

  const value = (key: string) => Number(root.querySelector<HTMLElement>(`[data-stepper="${key}"]`)!.dataset.value);
  const setValue = (el: HTMLElement, n: number) => {
    const clamped = Math.max(0, Math.min(12, n));
    el.dataset.value = String(clamped);
    el.querySelector("output")!.textContent = String(clamped);
  };

  const addLog = (line: string) => {
    entries.unshift(line);
    entries.length = Math.min(entries.length, 3);
    log.innerHTML = entries.map((e) => `<li>${e}</li>`).join("");
  };

  const render = () => {
    const stock = value("stock");
    const channels = steppers.filter((s) => s.dataset.stepper !== "stock");
    const committed = channels.reduce((sum, s) => sum + Number(s.dataset.value), 0);
    const available = stock - committed;
    math.innerHTML = `${stock} in stock − ${committed} committed = <strong class="${available < 0 ? "neg" : ""}">${available < 0 ? "−" + Math.abs(available) : available}</strong> available`;

    alert.classList.remove("critical", "low", "ok");
    if (available < 0) {
      const sources = channels
        .filter((s) => Number(s.dataset.value) > 0)
        .map((s) => `${s.dataset.label} (${s.dataset.value})`)
        .join(", ");
      const short = Math.abs(available);
      alert.classList.add("critical");
      alert.innerHTML = `<span class="sev">Critical</span>${short} unit${short === 1 ? "" : "s"} short. Contributing orders: ${sources}. The seller picks a delay, a partial shipment, a refund, or a stock correction, and Claude drafts the message.`;
    } else if (available < LOW_STOCK) {
      alert.classList.add("low");
      alert.innerHTML = `<span class="sev">Low</span>Every order can ship, but only ${available} left.`;
    } else {
      alert.classList.add("ok");
      alert.innerHTML = `<span class="sev">OK</span>Every order can ship, with ${available} to spare.`;
    }
  };

  steppers.forEach((stepper) => {
    stepper.querySelectorAll<HTMLButtonElement>("[data-delta]").forEach((button) => {
      button.addEventListener("click", () => {
        setValue(stepper, Number(stepper.dataset.value) + Number(button.dataset.delta));
        render();
      });
    });
  });

  root.querySelector("[data-reimport]")!.addEventListener("click", () => {
    addLog("shopify:1042 already exists → updated in place, nothing added");
    render();
  });

  root.querySelector("[data-neworder]")!.addEventListener("click", () => {
    const shopify = root.querySelector<HTMLElement>('[data-stepper="shopify"]')!;
    const before = Number(shopify.dataset.value);
    setValue(shopify, before + 1);
    addLog(
      Number(shopify.dataset.value) > before
        ? `shopify:${nextOrder++} is new → created, +1 committed`
        : "Demo limit reached: 12 Shopify units"
    );
    render();
  });

  render();
}

export function setupDemos() {
  setupRiskPlayground();
  setupStockDemo();
}

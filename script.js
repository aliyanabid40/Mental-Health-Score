const API_URL = "https://mental-health-score-kappa.vercel.app";

const form = document.getElementById("signal-form");
const errorEl = document.getElementById("form-error");
const submitBtn = document.getElementById("submit-btn");
const panel = document.getElementById("result-panel");
const stressInput = form.elements.namedItem("stress_level");
const scoreValue = document.getElementById("score-value");
const signalTitle = document.getElementById("signal-title");
const signalBody = document.getElementById("signal-body");
const needle = document.getElementById("needle");
const arcFill = document.getElementById("arc-fill");

document.querySelectorAll(".pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    document.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    stressInput.value = pill.dataset.stress;
  });
});

document.getElementById("again-btn").addEventListener("click", () => {
  setPanel("idle");
  resetGauge();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();

  const payload = readPayload();
  const localError = validate(payload);
  if (localError) {
    showError(localError);
    return;
  }

  setLoading(true);
  setPanel("loading");
  const started = Date.now();

  try {
    const data = await requestScore(payload);
    await waitAtLeast(started, 900);
    revealScore(data.predicted_mental_health_score);
  } catch (err) {
    await waitAtLeast(started, 400);
    setPanel("idle");
    showError(err.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
});

function readPayload() {
  const get = (name) => form.elements.namedItem(name).value;
  return {
    age: Number(get("age")),
    gender: get("gender"),
    country: get("country").trim(),
    academic_level: get("academic_level"),
    most_used_platform: get("most_used_platform"),
    purpose_of_use: get("purpose_of_use"),
    avg_daily_usage_hours: Number(get("avg_daily_usage_hours")),
    daily_unlocks: Number(get("daily_unlocks")),
    study_hours: Number(get("study_hours")),
    physical_activity_hours: Number(get("physical_activity_hours")),
    sleep_hours_per_night: Number(get("sleep_hours_per_night")),
    stress_level: get("stress_level"),
  };
}

function validate(data) {
  if (!Number.isFinite(data.age) || data.age < 10 || data.age > 100) {
    return "Age must be between 10 and 100.";
  }
  if (!data.gender) return "Please select a gender.";
  if (!data.country) return "Please enter a country.";
  if (!data.academic_level) return "Please select an academic level.";
  if (!data.most_used_platform) return "Please select a platform.";
  if (!data.purpose_of_use) return "Please select a primary purpose.";
  if (
    !Number.isFinite(data.avg_daily_usage_hours) ||
    data.avg_daily_usage_hours < 0 ||
    data.avg_daily_usage_hours > 24
  ) {
    return "Average daily screen time must be between 0 and 24 hours.";
  }
  if (!Number.isFinite(data.daily_unlocks) || data.daily_unlocks < 0) {
    return "Daily phone unlocks cannot be negative.";
  }
  if (!Number.isFinite(data.study_hours) || data.study_hours < 0 || data.study_hours > 24) {
    return "Study hours must be between 0 and 24.";
  }
  if (
    !Number.isFinite(data.physical_activity_hours) ||
    data.physical_activity_hours < 0 ||
    data.physical_activity_hours > 24
  ) {
    return "Physical activity must be between 0 and 24 hours.";
  }
  if (
    !Number.isFinite(data.sleep_hours_per_night) ||
    data.sleep_hours_per_night < 0 ||
    data.sleep_hours_per_night > 24
  ) {
    return "Sleep hours must be between 0 and 24.";
  }
  if (!data.stress_level) return "Please select a perceived stress level.";
  return null;
}

async function requestScore(payload) {
  let response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Unable to connect to the FastAPI server. Please make sure the backend is running at http://127.0.0.1:8000",
    );
  }

  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    throw new Error(parseApiError(json, response.status));
  }

  const score = json && json.predicted_mental_health_score;
  if (typeof score !== "number") {
    throw new Error("The API did not return a predicted score.");
  }
  return json;
}

function parseApiError(json, status) {
  if (json && typeof json.detail === "string") return json.detail;
  if (json && Array.isArray(json.detail) && json.detail.length) {
    return json.detail
      .map((item) => {
        const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : "";
        return item.msg ? (field ? `${field}: ${item.msg}` : item.msg) : "";
      })
      .filter(Boolean)
      .join(" ");
  }
  if (status === 422) return "Some inputs are invalid. Please review the form.";
  if (status === 400) return "The server could not read that request.";
  if (status === 500) return "The prediction service had an internal error.";
  return `Request failed (${status}).`;
}

function revealScore(raw) {
  const score = normalizeScore(raw);
  const band = signalBand(score);
  const copy = signalCopy(band);

  resetGauge();
  signalTitle.textContent = copy.title;
  signalBody.textContent = copy.body;
  setPanel("ready");

  requestAnimationFrame(() => {
    arcFill.classList.add("is-on");
    needle.classList.add("is-on");
    const angle = -90 + (score / 10) * 180;
    needle.style.transform = `rotate(${angle}deg)`;
    countUp(scoreValue, score, 1100);
  });
}

function normalizeScore(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  const scaled = n > 10 ? n / 10 : n;
  return Math.round(Math.min(10, Math.max(0, scaled)) * 100) / 100;
}

function signalBand(score) {
  if (score >= 7.5) return "strong";
  if (score >= 6) return "steady";
  if (score >= 4.5) return "mixed";
  return "strained";
}

function signalCopy(band) {
  const map = {
    strong: {
      title: "Signal: strong",
      body: "Your habits point to a well-supported, resilient baseline. Keep it up.",
    },
    steady: {
      title: "Signal: steady",
      body: "Your habits sketch a balanced baseline. Small sleep or movement shifts could still help.",
    },
    mixed: {
      title: "Signal: mixed",
      body: "The read is mixed — screen load, sleep, or stress may be pulling the baseline down.",
    },
    strained: {
      title: "Signal: strained",
      body: "The model sees a strained baseline. This is a demo read, not a diagnosis.",
    },
  };
  return map[band];
}

function countUp(el, target, duration) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    el.textContent = target.toFixed(2);
    return;
  }
  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * eased).toFixed(2);
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function resetGauge() {
  arcFill.classList.remove("is-on");
  needle.classList.remove("is-on");
  needle.style.transform = "rotate(-90deg)";
  scoreValue.textContent = "0.00";
}

function setPanel(state) {
  panel.dataset.state = state;
}

function setLoading(on) {
  submitBtn.disabled = on;
  submitBtn.classList.toggle("is-loading", on);
  submitBtn.querySelector(".btn-label").textContent = on ? "Reading…" : "Read my signal";
}

function showError(message) {
  errorEl.hidden = false;
  errorEl.textContent = message;
}

function hideError() {
  errorEl.hidden = true;
  errorEl.textContent = "";
}

function waitAtLeast(started, ms) {
  const left = ms - (Date.now() - started);
  return left > 0 ? new Promise((resolve) => setTimeout(resolve, left)) : Promise.resolve();
}

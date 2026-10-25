import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import data from "./data.json";
import { DAY, HOUR, MINUTE, formatDuration, parsePacific, splitDuration } from "./time.js";

// Incidents sorted oldest -> newest, regardless of how they're typed in the JSON
function loadIncidents() {
  try {
    const incidents = data.history.map((entry, id) => ({
      ...entry,
      id,
      at: parsePacific(entry.date, entry.time).getTime(),
    }));
    return { incidents: incidents.sort((a, b) => a.at - b.at) };
  } catch (err) {
    return { incidents: [], error: err.message };
  }
}

// Longest streak is typed into the JSON as { days, hours, minutes }
function longestStreakMs() {
  const { days = 0, hours = 0, minutes = 0 } = data.longestStreak ?? {};
  return days * DAY + hours * HOUR + minutes * MINUTE;
}

function statusFor(days) {
  const levels = [...data.statusLevels].sort((a, b) => a.minDays - b.minDays);
  return levels.filter((level) => days >= level.minDays).pop();
}

function useNow(interval = 1000) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

const pad = (n) => String(n).padStart(2, "0");

const rise = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = (gap, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 2 + Math.random() * 3,
  duration: 6 + Math.random() * 8,
  delay: Math.random() * 6,
}));

function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="grid" />
      <motion.div
        className="orb orb-a"
        animate={{ x: [0, 120, -40, 0], y: [0, 60, 120, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="orb orb-b"
        animate={{ x: [0, -140, 30, 0], y: [0, -50, 80, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="particle"
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -60, 0], opacity: [0, 0.9, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// Each character rolls in from below when it changes
function RollingDigits({ value }) {
  return (
    <span className="digits">
      {value.split("").map((char, i) => (
        <span className="slot" key={value.length - i}>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={char}
              initial={{ y: "70%", opacity: 0, filter: "blur(6px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: "-70%", opacity: 0, filter: "blur(6px)" }}
              transition={{ type: "spring", stiffness: 260, damping: 24, delay: i * 0.05 }}
            >
              {char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

function Unit({ value, label, delay }) {
  return (
    <motion.div className="unit" variants={rise} whileHover={{ y: -6, scale: 1.03 }}>
      <div className="scan-wrap" aria-hidden="true">
        <motion.div
          className="scan"
          animate={{ y: ["-120%", "320%"] }}
          transition={{ duration: 3.2, delay, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
        />
      </div>
      <RollingDigits value={value} />
      <span className="label">{label}</span>
    </motion.div>
  );
}

function Separator() {
  return (
    <motion.span
      className="sep"
      animate={{ opacity: [0.7, 0.15, 0.7] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      :
    </motion.span>
  );
}

function Counter({ elapsed }) {
  const { days, hours, minutes, seconds } = splitDuration(elapsed);
  const empty = elapsed == null;
  return (
    <motion.div className="counter" role="timer" variants={stagger(0.12, 0.2)}>
      <Unit value={empty ? "--" : pad(days)} label="Days" delay={0} />
      <Separator />
      <Unit value={empty ? "--" : pad(hours)} label="Hours" delay={0.4} />
      <Separator />
      <Unit value={empty ? "--" : pad(minutes)} label="Minutes" delay={0.8} />
      <Separator />
      <Unit value={empty ? "--" : pad(seconds)} label="Seconds" delay={1.2} />
    </motion.div>
  );
}

function StatusPill({ text, error, level }) {
  // Border and background are derived from "color-all" in CSS
  const style = error || !level?.["color-all"] ? undefined : { "--status": level["color-all"] };
  return (
    <div className="status-row">
      <AnimatePresence mode="wait">
        {text && (
          <motion.p
            key={text}
            className={error ? "status error" : "status"}
            style={style}
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            {text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function RecordPanel({ current, pastBest, hasPast }) {
  const isRecord = current >= pastBest;
  const progress = pastBest > 0 ? Math.min(current / pastBest, 1) : 1;
  return (
    <motion.article className={isRecord ? "panel record is-record" : "panel record"} variants={rise}>
      <h2>{data.recordLabel}</h2>
      <div className="record-main">
        <p className="stamp">{formatDuration(isRecord ? current : pastBest)}</p>
        <AnimatePresence>
          {isRecord && (
            <motion.span
              className="badge shimmer"
              initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
            >
              {data.newRecordText}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="bar">
        <motion.div
          className="fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.6 }}
        />
      </div>
      <p className="bar-caption">
        {isRecord
          ? hasPast && `${data.previousBestLabel}: ${formatDuration(pastBest)}`
          : `${data.currentStreakLabel}: ${formatDuration(current)} · ${(progress * 100).toFixed(1)}% ${data.ofRecordLabel}`}
      </p>
    </motion.article>
  );
}

function IncidentLog({ incidents }) {
  const latestId = incidents.at(-1)?.id;
  const ordered = data.newestFirst ? [...incidents].reverse() : incidents;
  return (
    <motion.section className="panel log" variants={rise}>
      <h2>{data.historyTitle}</h2>
      {ordered.length === 0 ? (
        <p className="note">{data.noHistoryText}</p>
      ) : (
        <motion.ul variants={stagger(0.08, 0.5)}>
          {ordered.map((entry) => {
            const latest = entry.id === latestId;
            return (
              <motion.li
                key={entry.id}
                layout
                className={latest ? "latest" : undefined}
                variants={{
                  hidden: { opacity: 0, x: -24 },
                  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200, damping: 24 } },
                }}
                whileHover={{ x: 6 }}
              >
                <span className="when">{`${entry.date} · ${entry.time}`}</span>
                <span className="subject">
                  {entry.subject}
                  {latest && (
                    <motion.span
                      className="badge live-badge"
                      animate={{ opacity: [1, 0.45, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    >
                      {data.latestLabel}
                    </motion.span>
                  )}
                </span>
                <span className="note">{entry.note}</span>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </motion.section>
  );
}

export default function App() {
  const now = useNow();
  const { incidents, error } = loadIncidents();
  const first = incidents[0];
  // The counter and the current streak both run from the first incident
  const elapsed = first ? Math.max(0, now - first.at) : null;
  const longestStreak = longestStreakMs();

  // Tab title shows the live elapsed time
  let tabTitle = data.title;
  if (elapsed != null) {
    const { days, hours, minutes, seconds } = splitDuration(elapsed);
    tabTitle = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s · ${data.title}`;
  }
  useEffect(() => {
    document.title = tabTitle;
  }, [tabTitle]);

  const level = first ? statusFor(splitDuration(elapsed).days) : undefined;
  let status = data.noHistoryText;
  if (error) status = error;
  else if (first) status = level?.label ?? "";

  return (
    <MotionConfig reducedMotion="user">
      <Backdrop />
      <motion.main className="shell" initial="hidden" animate="show" variants={stagger(0.15)}>
        <motion.header className="topbar" variants={rise}>
          <span className="sys">{data.systemLabel}</span>
          <span className="live" style={data.liveColor ? { "--live": data.liveColor } : undefined}>
            <span className="dot" />
            LIVE
          </span>
        </motion.header>

        <motion.section className="hero" variants={stagger(0.12)}>
          <motion.h1 variants={rise}>{data.headline}</motion.h1>
          <motion.p className="tagline" variants={rise}>
            {data.tagline}
          </motion.p>
          <Counter elapsed={elapsed} />
          <StatusPill text={status} error={Boolean(error)} level={level} />
        </motion.section>

        {first && <RecordPanel current={elapsed} pastBest={longestStreak} hasPast={longestStreak > 0} />}

        <IncidentLog incidents={incidents} />
      </motion.main>
    </MotionConfig>
  );
}

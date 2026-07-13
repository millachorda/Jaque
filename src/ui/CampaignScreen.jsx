import React, { useState } from "react";
import { T, btn } from "./theme.js";
import { CHAPTERS, TOTAL_LEVELS, skillForLevel } from "../engine/campaign.js";
import { totalStars, isUnlocked } from "../state/store.js";
function Stars({
  n
}) {
  return <span style={{
    letterSpacing: 1,
    fontSize: 10
  }}>
            {"★".repeat(n)}<span style={{
      color: "#3a3f48"
    }}>{"★".repeat(3 - n)}</span>
        </span>;
}
export default function CampaignScreen({
  progress,
  onPlay,
  onExit
}) {
  const current = progress.unlockedLevel || 1;
  const currentChapter = CHAPTERS.find(c => current >= c.from && current <= c.to) || CHAPTERS[0];
  const [openChapter, setOpenChapter] = useState(currentChapter.name);
  return <div>
            <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 14,
      flexWrap: "wrap"
    }}>
                <h2 style={{
        margin: 0,
        fontFamily: "Georgia, serif"
      }}>Campaña</h2>
                <span style={{
        color: T.amber,
        fontWeight: 700
      }}>★ {totalStars(progress)} / {TOTAL_LEVELS * 3}</span>
                <span style={{
        color: T.muted,
        fontSize: 13
      }}>Nivel {current} desbloqueado</span>
                <button onClick={onExit} style={{
        ...btn("transparent", T.cream, T.line),
        marginLeft: "auto"
      }}>Menú</button>
            </div>

            {CHAPTERS.map(ch => {
      const open = openChapter === ch.name;
      const chapStars = Object.entries(progress.stars || {}).filter(([lv]) => +lv >= ch.from && +lv <= ch.to).reduce((s, [, v]) => s + v, 0);
      const chapUnlocked = current >= ch.from;
      return <div key={ch.name} style={{
        marginBottom: 10,
        border: `1px solid ${T.line}`,
        borderRadius: 8,
        overflow: "hidden",
        opacity: chapUnlocked ? 1 : 0.5
      }}>
                        <button onClick={() => setOpenChapter(open ? null : ch.name)} style={{
          width: "100%",
          textAlign: "left",
          background: T.panel,
          border: "none",
          cursor: "pointer",
          padding: "12px 14px",
          color: T.cream
        }}>
                            <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10
          }}>
                                <span style={{
              fontWeight: 700
            }}>{ch.name}</span>
                                <span style={{
              fontSize: 12,
              color: T.muted
            }}>niveles {ch.from}–{ch.to}</span>
                                <span style={{
              marginLeft: "auto",
              fontSize: 12,
              color: T.amber
            }}>★ {chapStars}</span>
                            </div>
                            <div style={{
            fontSize: 12,
            color: T.muted,
            marginTop: 3
          }}>{ch.theme}</div>
                        </button>
                        {open && <div style={{
          padding: 12,
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          background: T.ink
        }}>
                                {range(ch.from, ch.to).map(lv => {
            const unlocked = isUnlocked(progress, lv);
            const stars = progress.stars?.[lv] || 0;
            const isMilestone = lv % 25 === 0;
            return <button key={lv} disabled={!unlocked} onClick={() => onPlay(lv)} title={isMilestone ? "Puzzle de mate" : `skill ${skillForLevel(lv)}/20`} style={{
              width: 54,
              minHeight: 46,
              borderRadius: 6,
              cursor: unlocked ? "pointer" : "not-allowed",
              border: `1px solid ${lv === current ? T.amber : T.line}`,
              background: !unlocked ? "#171a1f" : isMilestone ? "#2a2410" : T.panel,
              color: unlocked ? T.cream : "#4a505a",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              fontSize: 12,
              fontWeight: 700
            }}>
                                            <span>{unlocked ? lv : "🔒"}</span>
                                            {unlocked && <Stars n={stars} />}
                                        </button>;
          })}
                            </div>}
                    </div>;
    })}
        </div>;
}
function range(a, b) {
  const out = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}

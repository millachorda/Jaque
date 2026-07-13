import React from "react";
export function PieceShape({
  type,
  fill,
  stroke
}) {
  const common = {
    fill,
    stroke,
    strokeWidth: 1.5,
    strokeLinejoin: "round"
  };
  switch (type) {
    case "p":
      return <g {...common}>
                    <path d="M22.5,9 C20,9 18,10.8 18,13 C18,14.6 18.8,16 20,16.9
                             C17.3,18.4 15.4,21.2 15.4,24.4 C15.4,26.8 16.6,28.9 18.4,30.2
                             C14.6,32 11,35.6 11,39.5 L34,39.5 C34,35.6 30.4,32 26.6,30.2
                             C28.4,28.9 29.6,26.8 29.6,24.4 C29.6,21.2 27.7,18.4 25,16.9
                             C26.2,16 27,14.6 27,13 C27,10.8 25,9 22.5,9 Z" />
                </g>;
    case "r":
      return <g {...common} strokeLinecap="round">
                    <path d="M13,10 L13,14 L16.5,14 L16.5,11.5 L20.5,11.5 L20.5,14
                             L24.5,14 L24.5,11.5 L28.5,11.5 L28.5,14 L32,14 L32,10 Z" />
                    <path d="M15.5,14 L29.5,14 L28,17.5 L17,17.5 Z" />
                    <path d="M17,17.5 L28,17.5 L28,29 L17,29 Z" />
                    <path d="M15,29 L30,29 L32.5,32.5 L12.5,32.5 Z" />
                    <path d="M11,32.5 L34,32.5 L34,36 L11,36 Z" />
                    <path d="M9.5,36 L35.5,36 L35.5,39.5 L9.5,39.5 Z" />
                </g>;
    case "b":
      return <g {...common}>
                    <circle cx="22.5" cy="9" r="2.6" />
                    <path d="M22.5,11.5 C17,15 15.5,20 16.5,24.5 C17.2,27.6 19,29.5 22.5,30.5
                             C26,29.5 27.8,27.6 28.5,24.5 C29.5,20 28,15 22.5,11.5 Z" />
                    <path d="M22.5,16 L22.5,24 M19,20.5 L26,20.5" strokeWidth="1.4" fill="none" />
                    <path d="M16,30.5 L29,30.5 L27.5,33.5 L17.5,33.5 Z" />
                    <path d="M13,33.5 L32,33.5 C31,36.5 26.5,37.5 22.5,37.5 C18.5,37.5 14,36.5 13,33.5 Z" />
                    <path d="M11.5,37.5 L33.5,37.5 L33.5,40 L11.5,40 Z" />
                </g>;
    case "n":
      return <g {...common}>
                    <path d="M14,33 C14,27 16,24 18.5,21 C16.5,22 14.5,22.5 12.5,21.5
                             C11,20.5 11.2,18.8 12.5,18 C12,16.5 12.5,14.5 14,13
                             C14.5,11.5 15,10 16,9.5 C16.3,10.8 16.8,11.5 17.5,11.8
                             C18.2,10.5 19.2,9.2 20.5,9 C25,9.2 29,12 31,17
                             C33,22 33.5,28 33,33 Z" />
                    <path d="M12.5,32.5 L33,32.5 L34.5,36 L11,36 Z" />
                    <path d="M10,36 L35,36 L35,39.5 L10,39.5 Z" />
                    <circle cx="15.8" cy="14.8" r="1.1" fill={stroke} stroke="none" />
                    <path d="M13.2,18.5 C14.5,18 15.8,18.2 16.8,19" fill="none" strokeWidth="1.1" />
                </g>;
    case "q":
      return <g {...common}>
                    <path d="M9,26 L9,14 L13,24 L16.5,12 L19.5,24 L22.5,11 L25.5,24 L28.5,12
                             L32,24 L36,14 L36,26 Z" />
                    <circle cx="9" cy="14" r="2.2" />
                    <circle cx="16.5" cy="12" r="2.2" />
                    <circle cx="22.5" cy="11" r="2.2" />
                    <circle cx="28.5" cy="12" r="2.2" />
                    <circle cx="36" cy="14" r="2.2" />
                    <path d="M12,26 L33,26 L34.5,30 L10.5,30 Z" />
                    <path d="M10.5,30 L34.5,30 C33,34 27.5,35.5 22.5,35.5 C17.5,35.5 12,34 10.5,30 Z" />
                    <path d="M9.5,35.5 L35.5,35.5 L35.5,39.5 L9.5,39.5 Z" />
                </g>;
    case "k":
      return <g {...common}>
                    <path d="M20.3,2.5 L24.7,2.5 L24.7,6 L28.2,6 L28.2,10.2 L24.7,10.2 L24.7,13.8
                             L20.3,13.8 L20.3,10.2 L16.8,10.2 L16.8,6 L20.3,6 Z" />
                    <path d="M22.5,13.5 C17,13.5 13,17.5 13,22.5 C13,25.6 14.6,28.2 17.2,29.7
                             C14.3,31.2 12,34 12,37 L33,37 C33,34 30.7,31.2 27.8,29.7
                             C30.4,28.2 32,25.6 32,22.5 C32,17.5 28,13.5 22.5,13.5 Z" />
                    <path d="M16.5,29.7 L28.5,29.7" strokeWidth="1.3" fill="none" />
                    <path d="M10.5,37 L34.5,37 C33.3,39.6 27.5,40.5 22.5,40.5 C17.5,40.5 11.7,39.6 10.5,37 Z" />
                </g>;
    default:
      return null;
  }
}
export function Piece({
  type,
  color,
  size = "82%"
}) {
  const fill = color === "w" ? "#f7f4ec" : "#2b2f36";
  const stroke = color === "w" ? "#2b2f36" : "#cfd3da";
  return <svg viewBox="0 0 45 45" width={size} height={size} style={{
    display: "block",
    overflow: "visible",
    filter: "drop-shadow(0 1px 1px rgba(0,0,0,.35))"
  }}>
            <PieceShape type={type} fill={fill} stroke={stroke} />
        </svg>;
}

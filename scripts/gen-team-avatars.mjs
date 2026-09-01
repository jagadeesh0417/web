import { writeFileSync } from "fs";

const authors = [
  { file: "sneha", initials: "SK", color: "#7c3aed", name: "Sneha Kulkarni" },
  { file: "priya", initials: "PS", color: "#2563eb", name: "Priya Sharma" },
  { file: "rahul", initials: "RI", color: "#059669", name: "Rahul Iyer" },
  { file: "arjun", initials: "AR", color: "#d97706", name: "Arjun Reddy" },
];

for (const a of authors) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <circle cx="20" cy="20" r="20" fill="${a.color}"/>
  <text x="20" y="20" text-anchor="middle" dominant-baseline="central" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="white">${a.initials}</text>
</svg>`;
  writeFileSync(`public/team/${a.file}.svg`, svg);
  console.log(`Created ${a.file}.svg`);
}

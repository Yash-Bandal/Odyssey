import React, { useMemo } from "react";
import { format, addDays, differenceInCalendarDays } from "date-fns";

/*
  props:
    - year (number) e.g. 2025
    - data: { '2025-06-20': 2, ... }  // commits per day
    - maxColumnsWidthOptional: for styling
*/
export default function HeatmapGrid({ year = new Date().getFullYear(), data = {} }) {
    const days = useMemo(() => {
        const jan1 = new Date(year, 0, 1);
        const dec31 = new Date(year, 11, 31);
        const padStart = jan1.getDay(); // 0-6
        const dates = [];

        for (let i = 0; i < padStart; i++) dates.push({ dateStr: null, commits: null, pad: true });

        let cur = new Date(jan1);
        while (cur <= dec31) {
            const s = cur.toISOString().split("T")[0];
            dates.push({ dateStr: s, commits: data[s] ?? 0, pad: false });
            cur = addDays(cur, 1);
        }
        // pad end
        const total = dates.length;
        const weeks = Math.ceil(total / 7);
        const remain = weeks * 7 - total;
        for (let i = 0; i < remain; i++) dates.push({ dateStr: null, commits: null, pad: true });

        return dates;
    }, [year, data]);

    const colorFor = (commits) => {
        // color scheme similar to your original
        const colors = ["#e5e7eb", "#e6ffe6", "#ccffcc", "#99ff99", "#33cc33"];
        if (commits === null || commits === undefined) return "#F3F4F6"; // pad
        return colors[Math.min(commits, colors.length - 1)] ?? colors[0];
    };

    return (
        <div className="rounded-lg bg-white/50 p-2 overflow-x-auto">
            <div
                className="grid"
                style={{
                    gridAutoFlow: "column",
                    gridAutoColumns: "minmax(18px, 1fr)",
                    gridTemplateRows: "repeat(7, minmax(12px, 1fr))",
                    gap: 6,
                    padding: 10,
                }}
            >
                {days.map((it, idx) => {
                    const bg = colorFor(it.commits);
                    const tooltip = it.dateStr ? `${it.dateStr}: ${it.commits} commits` : "Outside year";
                    return (
                        <div
                            key={idx}
                            title={tooltip}
                            style={{
                                backgroundColor: bg,
                                aspectRatio: "1 / 1",
                                borderRadius: 6,
                                border: "1px solid rgba(0,0,0,0.04)",
                                transition: "transform .12s, box-shadow .12s",
                            }}
                            className="heatmap-day"
                        />
                    );
                })}
            </div>
        </div>
    );
}

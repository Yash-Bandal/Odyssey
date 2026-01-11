// src/components/Dashboard/StreaksCalendar.jsx
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";

const StreaksCalendar = ({ heat = {}, streak = 0 }) => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    const days = eachDayOfInterval({ start, end });

    const colorFor = (mins) => {
        if (!mins) return "bg-gray-700/40";
        if (mins < 15) return "bg-purple-600/70";
        if (mins < 60) return "bg-indigo-600/80";
        return "bg-green-500/90";
    };

    return (
        <div>
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Streaks</h4>
                <div className="text-sm text-gray-500">Streak: <span className="font-bold text-gray-800 dark:text-gray-100">{streak}d</span></div>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-2">
                {days.map((d) => {
                    const k = format(d, "yyyy-MM-dd");
                    return (
                        <div key={k} className="w-8 h-8 rounded-md flex items-center justify-center text-xs">
                            <div className={`w-full h-full rounded-md ${colorFor(heat[k])}`} title={`${k} • ${heat[k] || 0} min`} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StreaksCalendar;

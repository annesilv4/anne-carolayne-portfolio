import type { ReactNode } from "react";

export function ph(text: string): ReactNode {
    return text.split(/(\[[^\]]+\])/g).map((part, i) =>
        /^\[[^\]]+\]$/.test(part) ? (
            <span className="ph" key={i}>
                {part}
            </span>
        ) : (
            part
        ),
    );
}

export const isPh = (text: string) => /\[[^\]]+\]/.test(text);
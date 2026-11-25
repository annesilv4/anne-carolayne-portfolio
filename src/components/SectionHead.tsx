import { ReactNode } from "react";

interface Props {
    num: string;
    label: string;
    lines: ReactNode[];
    sub?: string;
}

export default function SectionHead({ num, label, lines, sub }: Props) {
    return (
        <div className="sh">
            <p className="eye rv">
                <b>{num}</b> / {label}
            </p>
            <h2>
                {lines.map((l, i) => (
                    <span className="ln" key={i}>
                        <span>{l}</span>
                    </span>
                ))}
            </h2>
            {sub ? <p className="sub rv">{sub}</p> : null}
        </div>
    );
}
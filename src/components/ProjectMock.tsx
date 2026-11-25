import type { CSSProperties } from "react";
import type { MockKind } from "@/data/content";

const h = (n: number) => ({ height: n }) as CSSProperties;
const vars = (o: Record<string, string | number>) => o as CSSProperties;

/** Captura provisória desenhada em CSS. Substitua por uma imagem real em `PROJECTS[n].image`. */
export default function ProjectMock({ kind, label }: { kind: MockKind; label: string }) {
    return (
        <div className="shot" role="img" aria-label={label}>
            <div className="shot-top"><i /><i /><i /><em /></div>
            {kind === 'dashboard' && (
                <div className="shot-body" style={vars({ '--h': '360px' })}>
                    <div className="col" style={{ width: '17%' }}>
                        <div className="blk vd" style={h(24)} />
                        <div className="blk" style={h(14)} />
                        <div className="blk" style={h(14)} />
                        <div className="blk" style={h(14)} />
                    </div>
                    <div className="col" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <div className="blk" style={{ flex: 1, height: 84 }} />
                            <div className="blk" style={{ flex: 1, height: 84 }} />
                            <div className="blk v" style={{ flex: 1, height: 84 }} />
                        </div>
                        <div className="blk" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 8, padding: 14 }}>
                            {([['vd', 34], ['vd', 52], ['v', 44], ['v', 70], ['vl', 92], ['v', 64], ['vd', 78]] as const).map(([c, ht], i) => (
                                <div key={i} className={`blk ${c} bar`} style={{ flex: 1, height: `${ht}%` }} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {kind === 'catalog' && (
                <div className="shot-body" style={vars({ '--h': '360px', display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12 })}>
                    {([['vd', '72%', '38%'], ['', '60%', '42%'], ['v', '80%', '34%']] as const).map(([c, w1, w2], i) => (
                        <div className="col" key={i}>
                            <div className={`blk ${c}`.trim()} style={{ flex: 1 }} />
                            <div className="blk" style={{ height: 10, width: w1 }} />
                            <div className="blk v" style={{ height: 10, width: w2 }} />
                        </div>
                    ))}
                </div>
            )}
            {kind === 'board' && (
                <div className="shot-body" style={vars({ '--h': '360px', gap: 12 })}>
                    {([['50%', ['', '']], ['60%', ['v', '', '']], ['44%', ['']]] as const).map(([w, cards], i) => (
                        <div className="col" style={{ flex: 1 }} key={i}>
                            <div className="blk vd" style={{ height: 10, width: w }} />
                            {cards.map((c, j) => (
                                <div key={j} className={`blk ${c}`.trim()} style={h(72)} />
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
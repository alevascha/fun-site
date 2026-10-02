export default function AnatomyBar({ groups }) {
  return (
    <div>
      <div style={{ display: 'flex', width: '100%', height: 40, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
        {groups.map(group => {
          const mid = group.swatches[Math.floor(group.swatches.length / 2)];
          const centerHex = mid.tones[Math.floor(mid.tones.length / 2)].hex;
          return <div key={group.name} style={{ width: group.weight + '%', background: centerHex }} />;
        })}
      </div>
      <div style={{ display: 'flex', width: '100%', marginTop: 5 }}>
        {groups.map(group => (
          <div key={group.name} style={{ width: group.weight + '%', fontSize: 9, color: 'var(--muted)' }}>
            <b style={{ display: 'block', color: 'var(--text)', fontSize: 10 }}>{group.name}</b>
            {group.percentage}
          </div>
        ))}
      </div>
    </div>
  );
}

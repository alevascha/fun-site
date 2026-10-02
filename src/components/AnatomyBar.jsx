import { motion } from 'framer-motion';

export default function AnatomyBar({ groups }) {
  return (
    <div>
      <div className="anatomy-bar">
        {groups.map(group => {
          const mid = group.swatches[Math.floor(group.swatches.length / 2)];
          const centerHex = mid.tones[Math.floor(mid.tones.length / 2)].hex;
          return (
            <motion.div
              key={group.name}
              title={`${group.name} · ${group.percentage}`}
              initial={false}
              animate={{ width: group.weight + '%', backgroundColor: centerHex }}
              whileHover={{ scaleY: 1.08 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', width: '100%', marginTop: 10 }}>
        {groups.map(group => (
          <motion.div
            key={group.name}
            initial={false}
            animate={{ width: group.weight + '%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 12, color: 'var(--muted)', minWidth: 0, overflow: 'hidden', paddingRight: 6 }}
          >
            <b style={{ display: 'block', color: 'var(--text)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.name}</b>
            {group.percentage}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

import type { CostItem } from "@/data/projects";
import styles from "./CostTable.module.css";

interface CostTableProps {
  items: CostItem[];
  dailyCost: string;
}

export function CostTable({ items, dailyCost }: CostTableProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Resource</th>
            <th>Unit</th>
            <th>Est. Monthly</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.resource}>
              <td>{item.resource}</td>
              <td className={styles.mono}>{item.unit}</td>
              <td className={styles.cost}>{item.monthlyCost}</td>
              <td className={styles.note}>{item.note ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.total}>
        Daily estimate: <span className={styles.totalValue}>{dailyCost}</span>
      </div>
    </div>
  );
}

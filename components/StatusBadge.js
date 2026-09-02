const LABEL = {
  pending: { hi: "लंबित", en: "Pending" },
  in_progress: { hi: "प्रक्रियाधीन", en: "In progress" },
  resolved: { hi: "निपटाया गया", en: "Resolved" },
};

const CLASS = {
  pending: "badge badge-pending",
  in_progress: "badge badge-progress",
  resolved: "badge badge-resolved",
};

export default function StatusBadge({ status, lang = "hi" }) {
  const info = LABEL[status] || LABEL.pending;
  return (
    <span className={CLASS[status] || CLASS.pending}>
      <span className="dot" />
      {info[lang]}
    </span>
  );
}

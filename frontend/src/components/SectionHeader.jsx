const SectionHeader = ({
  eyebrow,
  title,
  description,
  action,
  align = "left"
}) => {
  const centered = align === "center";

  return (
    <div
      className={`flex flex-col gap-4 ${
        centered
          ? "items-center text-center"
          : "lg:flex-row lg:items-end lg:justify-between"
      }`}
    >
      <div className={centered ? "max-w-3xl" : "max-w-3xl"}>
        {eyebrow && <span className="section-kicker">{eyebrow}</span>}
        <h2 className="section-title mt-4">{title}</h2>
        {description && <p className="section-copy mt-4">{description}</p>}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
};

export default SectionHeader;

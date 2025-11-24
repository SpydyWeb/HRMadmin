import DisplayFieldCard from "./displayCard";

interface FieldConfig {
  name: string;
  label: string;
  icon?: React.ReactNode | string;
}

interface SectionConfig {
  gridCols?: number;
  fields: FieldConfig[];
}

interface DisplaySectionProps {
  data: Record<string, any>;
  config: SectionConfig;
}

export default function DisplaySection({ data, config }: DisplaySectionProps) {
    console.log("config", config)
    console.log("data", data)
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-${config.gridCols || 2} gap-4`}
    >
      {config.fields.map((field) => {
        const value = data?.[field.name];
        console.log("value1", value)

        const iconElement = field.icon
          ? typeof field.icon === "string"
            ? <img src={field.icon} className="w-6 h-6" />
            : field.icon
          : null;

        return (
          <DisplayFieldCard
            key={field.name}
            // icon={iconElement}
            label={field.label}
            value={value}
          />
        );
      })}
    </div>
  );
}

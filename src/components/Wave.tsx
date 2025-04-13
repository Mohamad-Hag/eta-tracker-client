import clsx from "clsx";
import WaveGif from "../assets/wave.gif";

interface WaveProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
}

export default function Wave({ label, ...props }: WaveProps) {
  const { className, ...rest } = props;
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center fixed z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-light pointer-events-none select-none flying-animated",
        className
      )}
      {...rest}
    >
      <img src={WaveGif} />
      <span style={{ textShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)" }}>
        {label}
      </span>
    </div>
  );
}

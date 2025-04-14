import clsx from "clsx";
import WaveGif from "../assets/wave.gif";
import LoveGif from "../assets/love.gif";

interface WaveProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  type?: "love" | "wave";
}

export default function Wave({ label, type = 'wave', ...props }: WaveProps) {
  const { className, ...rest } = props;
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center fixed z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-light pointer-events-none select-none flying-animated",
        className
      )}
      {...rest}
    >
      <img src={type === "wave" ? WaveGif : LoveGif} />
      <span className="p-2 bg-[#ffffff90] rounded-full shadow-xl border-gray-100 border text-sm max-w-32 truncate">
        {label}
      </span>
    </div>
  );
}

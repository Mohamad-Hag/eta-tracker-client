import clsx from "clsx";

interface TextProps {
  children: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  className?: string;
}

export default function Text({
  children,
  rightIcon,
  leftIcon,
  className,
}: TextProps) {
  return (
    <div
      className={clsx(
        "py-10 text-center flex items-center gap-2 justify-center",
        className
      )}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </div>
  );
}

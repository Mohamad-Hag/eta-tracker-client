interface TextProps {
  children: React.ReactNode;
}

export default function Text({ children }: TextProps) {
  return <div className="py-10 text-center">{children}</div>;
}

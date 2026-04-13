import Image from "next/image";

export default function Logo({ size = 300, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Image
        src="/Play Port.svg"
        alt="Play Port Logo"
        width={size}
        height={size}
        priority
        className="object-contain drop-shadow-md"
      />
    </div>
  );
}

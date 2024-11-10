interface LaneProps {
  title: string;
  children: React.ReactNode;
}

export const Lane = ({ title, children }: LaneProps) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg min-w-[300px] w-1/3">
      <h2 className="font-bold text-xl mb-4">{title}</h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

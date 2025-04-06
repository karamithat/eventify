const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="container mx-auto px-4 sm:px-8 lg:px-16">{children}</div>
  );
};

export default Container;

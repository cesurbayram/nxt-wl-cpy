interface LoadingUiProps {
  isLoading: boolean;
}

const LoadingUi = ({ isLoading }: LoadingUiProps) => {
  return (
    isLoading && (
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-10 z-10 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-solid rounded-full animate-spin border-t-transparent" />
      </div>
    )
  );
};

export default LoadingUi;

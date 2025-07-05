
const Loading = () => {
    return (
        <div className="flex flex-col justify-center items-center min-h-[50vh]">
            <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#A08558]/20"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#A08558] absolute top-0"></div>
            </div>
            <p className="mt-4 text-[#A08558] font-medium">جاري التحميل...</p>
      </div>
    );
}

export default Loading;

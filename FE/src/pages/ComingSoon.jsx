import React from 'react';
import { Construction } from 'lucide-react';

const ComingSoon = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <div className="w-24 h-24 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-6">
        <Construction size={48} />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-500 max-w-md">
        Tính năng này đang trong quá trình phát triển và sẽ sớm được ra mắt trong bản cập nhật tiếp theo. Cảm ơn bạn đã kiên nhẫn!
      </p>
    </div>
  );
};

export default ComingSoon;

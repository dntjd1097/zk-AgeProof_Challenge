import {
    CONTRACT_ADDRESS,
    CHAIN_ID,
    CHAIN_NAME,
} from '@/constants/contract';

export const NetworkInfo = () => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                네트워크 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="font-medium text-gray-700">
                        네트워크:
                    </span>
                    <span className="ml-2 text-gray-600">
                        {CHAIN_NAME}
                    </span>
                </div>
                <div>
                    <span className="font-medium text-gray-700">
                        Chain ID:
                    </span>
                    <span className="ml-2 text-gray-600">
                        {CHAIN_ID}
                    </span>
                </div>
                <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">
                        컨트랙트 주소:
                    </span>
                    <span className="ml-2 text-gray-600 font-mono">
                        {CONTRACT_ADDRESS}
                    </span>
                </div>
            </div>
        </div>
    );
};

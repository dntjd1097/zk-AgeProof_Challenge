import { useForm } from 'react-hook-form';
import { FormData } from '@/types';

interface ProofFormProps {
    onSubmit: (data: FormData) => void;
    isLoading: boolean;
}

export const ProofForm = ({
    onSubmit,
    isLoading,
}: ProofFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                증명 정보 입력
            </h2>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        나이 (Age)
                    </label>
                    <input
                        {...register('age', {
                            required: '나이를 입력해주세요',
                            min: {
                                value: 1,
                                message:
                                    '올바른 나이를 입력해주세요',
                            },
                            max: {
                                value: 120,
                                message:
                                    '올바른 나이를 입력해주세요',
                            },
                        })}
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="예: 25"
                    />
                    {errors.age && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.age.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        논스 (Nonce)
                    </label>
                    <input
                        {...register('nonce', {
                            required: '논스를 입력해주세요',
                            min: {
                                value: 1,
                                message:
                                    '양수를 입력해주세요',
                            },
                        })}
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="예: 12345"
                    />
                    {errors.nonce && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.nonce.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        최소 나이 (Min Age)
                    </label>
                    <input
                        {...register('minAge', {
                            required:
                                '최소 나이를 입력해주세요',
                            min: {
                                value: 1,
                                message:
                                    '양수를 입력해주세요',
                            },
                        })}
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="예: 20"
                        defaultValue={20}
                    />
                    {errors.minAge && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.minAge.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading
                        ? '증명 생성 중...'
                        : '증명 생성'}
                </button>
            </form>
        </div>
    );
};

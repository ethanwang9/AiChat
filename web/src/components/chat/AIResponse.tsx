import { FC } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface AIResponseProps {
    thinking: string;
    content: string;
}

const AIResponse: FC<AIResponseProps> = ({ thinking, content }) => {
    return (
        <div>
            {thinking && (
                <details open className="mb-4 p-3 rounded-md border border-gray-200">
                    <summary className="font-semibold text-gray-500 cursor-pointer">深度思考过程</summary>
                    <div className="mt-2 pl-4 border-l-2 border-gray-600 text-gray-200">
                        <MarkdownRenderer content={thinking} />
                    </div>
                </details>
            )}
            {content && <MarkdownRenderer content={content} />}
        </div>
    );
};

export default AIResponse; 
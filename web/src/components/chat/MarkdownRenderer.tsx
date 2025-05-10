import { FC } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Typography } from 'antd';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <Typography>
            <Markdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    code({ node, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');

                        // Handle code blocks with syntax highlighting
                        return !className?.includes('inline') && match ? (
                            <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {content}
            </Markdown>
        </Typography>
    );
};

export default MarkdownRenderer; 
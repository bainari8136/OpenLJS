import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

function ToolbarButton({ onClick, active, children, title }) {
    return (
        <button
            type="button"
            title={title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={`rounded px-2 py-1 text-xs font-medium ${
                active ? 'bg-blue-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            {children}
        </button>
    );
}

// Rich text editor with an HTML value/onChange API, styled as a drop-in replacement for a <textarea>.
export default function RichTextEditor({ id, value, onChange, rows = 6, placeholder, className = '' }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [2, 3] } }),
            Link.configure({ openOnClick: false, autolink: true }),
            Placeholder.configure({ placeholder: placeholder ?? '' }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                ...(id ? { id } : {}),
                class: 'prose prose-sm max-w-none focus:outline-none px-3 py-2',
            },
        },
    });

    useEffect(() => {
        if (!editor) return;
        const current = editor.getHTML();
        if ((value || '') !== current) {
            editor.commands.setContent(value || '', false);
        }
    }, [value, editor]);

    if (!editor) return null;

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl || 'https://');
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className={`rounded-md border border-gray-300 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 ${className}`}>
            <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1">
                <ToolbarButton title="Bold" active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></ToolbarButton>
                <ToolbarButton title="Italic" active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></ToolbarButton>
                <span className="mx-1 h-4 w-px bg-gray-300" />
                <ToolbarButton title="Heading" active={editor.isActive('heading', { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
                <ToolbarButton title="Subheading" active={editor.isActive('heading', { level: 3 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
                <span className="mx-1 h-4 w-px bg-gray-300" />
                <ToolbarButton title="Bullet list" active={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</ToolbarButton>
                <ToolbarButton title="Numbered list" active={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</ToolbarButton>
                <span className="mx-1 h-4 w-px bg-gray-300" />
                <ToolbarButton title="Link" active={editor.isActive('link')} onClick={setLink}>Link</ToolbarButton>
                <ToolbarButton title="Quote" active={editor.isActive('blockquote')}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}>&ldquo;&rdquo;</ToolbarButton>
            </div>
            <EditorContent editor={editor} style={{ minHeight: `${rows * 1.5}rem` }} />
        </div>
    );
}

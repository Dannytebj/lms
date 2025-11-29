import "./styles.scss";
import React, { useEffect } from "react";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface RichEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="control-group">
      <div className="button-group">
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
        >
          Bold
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          Italic
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
        >
          Strike
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive("code") ? "is-active" : ""}
        >
          Code
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
        >
          Clear marks
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().clearNodes().run()}
        >
          Clear nodes
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive("paragraph") ? "is-active" : ""}
        >
          Paragraph
        </Button>
        <Button
          variant={"ghost"}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
        >
          H1
        </Button>
        <Button
          variant={"ghost"}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          H2
        </Button>
        <Button
          variant={"ghost"}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : ""
          }
        >
          H3
        </Button>
        <Button
          variant={"ghost"}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          className={
            editor.isActive("heading", { level: 4 }) ? "is-active" : ""
          }
        >
          H4
        </Button>
        <Button
          variant={"ghost"}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          }
          className={
            editor.isActive("heading", { level: 5 }) ? "is-active" : ""
          }
        >
          H5
        </Button>
        <Button
          variant={"ghost"}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 6 }).run()
          }
          className={
            editor.isActive("heading", { level: 6 }) ? "is-active" : ""
          }
        >
          H6
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          Bullet list
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
        >
          Ordered list
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "is-active" : ""}
        >
          Code block
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
        >
          Blockquote
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          Horizontal rule
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().setHardBreak().run()}
        >
          Hard break
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().undo().run()}
        >
          Undo
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => editor.chain().focus().redo().run()}
        >
          Redo
        </Button>
      </div>
    </div>
  );
};

const AppEditor: React.FC<RichEditorProps> = ({
  content = "",
  onChange,
  placeholder = "Start writing...",
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        spellcheck: "false",
        placeholder: placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <>
      <MenuBar editor={editor} />
      <Separator />
      <EditorContent editor={editor} />
    </>
  );
};

export default AppEditor;

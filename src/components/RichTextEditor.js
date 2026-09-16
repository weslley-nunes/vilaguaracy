import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignJustify, List } from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder }) {
    const editorRef = useRef(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value && value !== undefined) {
            editorRef.current.innerHTML = value || "";
        }
    }, [value]);

    const exec = (command, value = null) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            editorRef.current.focus();
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col bg-white dark:bg-gray-800">
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button type="button" onClick={(e) => { e.preventDefault(); exec('bold'); }} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300" title="Negrito"><Bold size={16} /></button>
                <button type="button" onClick={(e) => { e.preventDefault(); exec('italic'); }} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300" title="Itálico"><Italic size={16} /></button>
                <button type="button" onClick={(e) => { e.preventDefault(); exec('underline'); }} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300" title="Sublinhado"><Underline size={16} /></button>
                <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                <button type="button" onClick={(e) => { e.preventDefault(); exec('justifyLeft'); }} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300" title="Alinhar à Esquerda"><AlignLeft size={16} /></button>
                <button type="button" onClick={(e) => { e.preventDefault(); exec('justifyCenter'); }} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300" title="Centralizar"><AlignCenter size={16} /></button>
                <button type="button" onClick={(e) => { e.preventDefault(); exec('justifyFull'); }} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300" title="Justificar (Poemas/Textos)"><AlignJustify size={16} /></button>
                <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                <button type="button" onClick={(e) => { e.preventDefault(); exec('insertUnorderedList'); }} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300" title="Lista"><List size={16} /></button>
                <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                <span className="text-[10px] text-gray-400 font-medium ml-1">Para pular linha, aperte Enter</span>
            </div>
            <div
                ref={editorRef}
                className="p-3 min-h-[120px] max-h-[300px] overflow-y-auto outline-none text-sm text-gray-800 dark:text-gray-100"
                contentEditable
                onInput={handleInput}
                onBlur={handleInput}
                placeholder={placeholder}
                style={{ whiteSpace: "pre-wrap" }}
            />
        </div>
    );
}

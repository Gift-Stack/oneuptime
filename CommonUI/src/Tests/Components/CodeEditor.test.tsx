import * as React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CodeEditor from '../../Components/CodeEditor/CodeEditor';
import CodeType from 'Common/Types/Code/CodeType';

import MonacoEditor from '@monaco-editor/react';

// Initialize Monaco Editor before running tests
render(<MonacoEditor />);

describe('Code Editor', () => {
    test('Code Editor renders with the least amount of props', () => {
        const { getByTestId } = render(
            <CodeEditor dataTestId="test-id" type={CodeType.JavaScript} />
        );

        const defaultClass: string =
            'block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm';

        const parent: HTMLElement = getByTestId('test-id');
        const editor: Element = parent.children[0]!;

        expect(parent).toBeInTheDocument();
        expect(parent.children.length).toEqual(1);
        expect(editor.children[1]!).toHaveClass(defaultClass);
    });

    test('Code Editor renders with Help text', () => {
        const className: string =
            'block w-full rounded-md border border-blue-300 bg-white py-2 px-3 text-sm';

        const { getByTestId } = render(
            <CodeEditor
                dataTestId="test-id"
                type={CodeType.Markdown}
                placeholder="Write something !!"
                className={className}
            />
        );

        const parent: HTMLElement = getByTestId('test-id');
        const helpText: Element = parent.children[0]!;
        const editor: Element = parent.children[1]!;

        expect(parent).toBeInTheDocument();
        expect(parent.children.length).toEqual(2);
        expect(helpText).toHaveTextContent(
            'Write something !!. This is in Markdown'
        );
        expect(editor.children[1]!).toHaveClass(className);
    });
});

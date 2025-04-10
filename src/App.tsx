import React from "react";

export const App: React.FC = () => {
  return (
    <div className="p-3 w-80 text-sm font-sans text-black dark:text-white bg-white dark:bg-gray-900">
      <h1 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400">
        LinkedIn Post Formatter
      </h1>
      <ul className="list-disc list-inside space-y-1">
        <li>Highlight text in LinkedIn's post editor</li>
        <li>
          Use toolbar buttons: <b>B</b> / <i>I</i> / <u>U</u> / <s>S</s>
        </li>
        <li>Select a style from the dropdown</li>
        <li> Shortcut Keys:
          <ul>
            <li>
              Use <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Cmd/Ctrl + B</code> for Bold
            </li>
            <li>
              Use <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Cmd/Ctrl + I</code> for Italic
            </li>
            <li>
              Use <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Cmd/Ctrl + U</code> for Underline
            </li>
          </ul>
        </li>
      </ul>
      <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 text-center">
        🚀 Works inside LinkedIn posts
        <div className="mt-1 space-x-2">
          <a
            href="https://github.com/danduh/linkedin-post-format"
            target="_blank"
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            GitHub
          </a>
          <a
            href="https://github.com/danduh/linkedin-post-format/issues/new"
            target="_blank"
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Feedback
          </a>
        </div>
      </div>
    </div>
  );
}

export default App
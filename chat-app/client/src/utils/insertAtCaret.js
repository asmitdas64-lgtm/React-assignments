/**
 * Inserts text at the current caret position or replaces selected text range,
 * returning updated full text and the new caret position.
 */
export function insertAtCaret(currentText, textToInsert, selectionStart = 0, selectionEnd = 0) {
  const start = Math.max(0, Math.min(selectionStart, currentText.length));
  const end = Math.max(start, Math.min(selectionEnd, currentText.length));

  const textBefore = currentText.slice(0, start);
  const textAfter = currentText.slice(end);

  const updatedText = textBefore + textToInsert + textAfter;
  const newCaretPosition = start + textToInsert.length;

  return {
    text: updatedText,
    caretPosition: newCaretPosition,
  };
}

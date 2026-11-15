import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';
import { user_list, CURRENT_USER } from './constants/users.js';

describe('App Core Integration & Accessibility Verification [CORE]', () => {
  it('executes full end-to-end messaging flow: sends message, assigns random author from user_list, renders above textbox, and increments like count', async () => {
    const user = userEvent.setup();
    render(<App />);

    const textbox = screen.getByRole('textbox', { name: /message #introductions/i });
    const sendButton = screen.getByRole('button', { name: /send message/i });
    const log = screen.getByRole('log', { name: /chat messages/i });

    // 1. Initial State: No messages yet, Send button disabled
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
    expect(sendButton).toBeDisabled();

    // 2. Type & Submit Message via Send Button
    await user.type(textbox, 'First test message from user');
    expect(sendButton).not.toBeDisabled();
    await user.click(sendButton);

    // 3. Verify Message renders above textbox
    expect(screen.queryByText(/no messages yet/i)).not.toBeInTheDocument();
    const messageItem = screen.getByText('First test message from user').closest('li');
    expect(messageItem).toBeInTheDocument();
    expect(log).toContainElement(messageItem);

    // Message list (log) must precede the textbox in DOM order
    expect(
      log.compareDocumentPosition(textbox) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    // Input is cleared & refocused
    expect(textbox).toHaveValue('');
    expect(textbox).toHaveFocus();

    // 4. Verify Author is randomly chosen strictly from user_list and NEVER CURRENT_USER
    const authorElement = messageItem.querySelector('.message-item__author');
    expect(authorElement).toBeInTheDocument();
    const authorName = authorElement.textContent;
    expect(user_list).toContain(authorName);
    expect(authorName).not.toBe(CURRENT_USER.name);

    // 5. Verify Like Button starts at 0 and increments on click
    const likeBtn = within(messageItem).getByRole('button', {
      name: /like message, 0 likes/i,
    });
    expect(likeBtn).toHaveTextContent('0');

    await user.click(likeBtn);
    expect(within(messageItem).getByRole('button', { name: /like message, 1 like/i })).toHaveTextContent('1');

    await user.click(likeBtn);
    expect(within(messageItem).getByRole('button', { name: /like message, 2 likes/i })).toHaveTextContent('2');

    // 6. Send second message using Enter key
    await user.type(textbox, 'Second message via Enter key{enter}');
    const secondMessage = screen.getByText('Second message via Enter key').closest('li');
    expect(secondMessage).toBeInTheDocument();

    const secondAuthor = secondMessage.querySelector('.message-item__author').textContent;
    expect(user_list).toContain(secondAuthor);

    // First message like count remains untouched (2)
    expect(within(messageItem).getByRole('button', { name: /like message, 2 likes/i })).toHaveTextContent('2');
    // Second message starts at 0
    expect(within(secondMessage).getByRole('button', { name: /like message, 0 likes/i })).toHaveTextContent('0');
  });

  it('safely renders HTML/script payload as escaped plain text without DOM injection', async () => {
    const user = userEvent.setup();
    render(<App />);

    const textbox = screen.getByRole('textbox', { name: /message #introductions/i });
    const xssPayload = '<img src=x onerror=alert(1)> <script>alert("xss")</script>';

    await user.type(textbox, `${xssPayload}{enter}`);

    // Rendered strictly as literal plain text
    expect(screen.getByText(xssPayload)).toBeInTheDocument();
    // Zero injected <img> or <script> elements inside the message log
    const log = screen.getByRole('log', { name: /chat messages/i });
    expect(log.querySelector('img')).toBeNull();
    expect(log.querySelector('script')).toBeNull();
  });

  it('manages focus cleanly across keyboard tab stops and validates ARIA labels', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Add a message so Like button exists in the DOM tab order
    const textbox = screen.getByRole('textbox', { name: /message #introductions/i });
    await user.type(textbox, 'Keyboard a11y message{enter}');

    // Verify all interactive elements have accessible names
    const addChannelBtn = screen.getByRole('button', { name: /add channel/i });
    const introChannelBtn = screen.getByRole('button', { name: /introductions/i });
    const likeBtn = screen.getByRole('button', { name: /like message/i });
    const emojiBtn = screen.getByRole('button', { name: /open emoji picker/i });
    const sendBtn = screen.getByRole('button', { name: /send message/i });

    expect(addChannelBtn).toHaveAccessibleName();
    expect(introChannelBtn).toHaveAccessibleName();
    expect(likeBtn).toHaveAccessibleName();
    expect(emojiBtn).toHaveAccessibleName();
    expect(textbox).toHaveAccessibleName();
    expect(sendBtn).toHaveAccessibleName();

    // Type text into textbox to enable the send button for tab navigation
    await user.type(textbox, 'Ready to send');
    expect(sendBtn).not.toBeDisabled();

    // Tab sequence from textbox to emoji button and send button
    textbox.focus();
    expect(textbox).toHaveFocus();

    await user.tab();
    expect(emojiBtn).toHaveFocus();

    await user.tab();
    expect(sendBtn).toHaveFocus();
  });
});

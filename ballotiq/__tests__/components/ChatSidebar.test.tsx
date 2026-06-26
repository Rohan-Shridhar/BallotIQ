import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatSidebar from '@/components/Assistant/ChatSidebar';
import type { ConversationMetadata } from '@/types';

describe('ChatSidebar', () => {
  const mockSetIsOpen = jest.fn();
  const mockOnSelectConversation = jest.fn();
  const mockOnDeleteConversation = jest.fn();
  const mockOnRenameConversation = jest.fn();
  const mockOnNewChat = jest.fn();

  const mockConversations: ConversationMetadata[] = [
    {
      id: '1',
      userId: 'test-user',
      title: 'Conversation 1',
      countryCode: 'US',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: 'test-user',
      title: 'Conversation 2',
      countryCode: 'US',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const defaultProps = {
    isOpen: true,
    setIsOpen: mockSetIsOpen,
    conversations: mockConversations,
    activeConversationId: '1',
    onSelectConversation: mockOnSelectConversation,
    onDeleteConversation: mockOnDeleteConversation,
    onRenameConversation: mockOnRenameConversation,
    onNewChat: mockOnNewChat,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the conversations grouped correctly when not loading', () => {
    render(<ChatSidebar {...defaultProps} isLoading={false} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
    expect(screen.getByText('Conversation 1')).toBeInTheDocument();
    expect(screen.getByText('Conversation 2')).toBeInTheDocument();
  });

  it('renders 4 skeleton loading items when isLoading is true', () => {
    const { container } = render(<ChatSidebar {...defaultProps} isLoading={true} />);
    
    // The skeleton items use the class animate-pulse
    const skeletonDivs = container.querySelectorAll('.animate-pulse');
    expect(skeletonDivs.length).toBe(4);

    // Verify conversation titles are NOT rendered
    expect(screen.queryByText('Conversation 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Conversation 2')).not.toBeInTheDocument();
  });

  it('renders empty state when there are no conversations and isLoading is false', () => {
    render(<ChatSidebar {...defaultProps} conversations={[]} isLoading={false} />);
    expect(screen.getByText('No previous chats. Start one above!')).toBeInTheDocument();
  });

  it('does NOT render empty state when there are no conversations but isLoading is true', () => {
    render(<ChatSidebar {...defaultProps} conversations={[]} isLoading={true} />);
    expect(screen.queryByText('No previous chats. Start one above!')).not.toBeInTheDocument();
  });

  it('defaults isLoading to false so it works without the prop', () => {
    render(<ChatSidebar {...defaultProps} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Conversation 1')).toBeInTheDocument();
  });
});
